import db from '../../config/db.js';
import ApiError from '../../utils/ApiError.js';
import { isPointInZone } from '../../utils/geo.js';
import { formatOrder, formatHistoryEntry } from '../../utils/formatters.js';

export async function createOrder(customerId, data) {
  const customer = await db('users').where({ id: customerId }).first();
  if (!customer) {
    throw new ApiError(404, 'Customer account not found.');
  }
  if (!customer.email_verified_at) {
    throw new ApiError(401, 'Please verify your email before placing an order.');
  }

  const {
    serviceType,
    pickupAddressId,
    deliveryAddressId,
    scheduledPickupStart,
    scheduledPickupEnd,
    items,
    idempotencyKey,
  } = data;

  // Idempotency check — same customer + same key returns the original order, no duplicate
  if (idempotencyKey) {
    const existing = await db('orders')
      .where({ customer_id: customerId, idempotency_key: idempotencyKey })
      .first();
    if (existing) {
      const existingItems = await db('order_items').where({ order_id: existing.id });
      return formatOrder(existing, existingItems);
    }
  }

  const pickupAddress = await db('addresses').where({ id: pickupAddressId }).first();
  if (!pickupAddress || pickupAddress.user_id !== customerId) {
    throw new ApiError(404, 'Pickup address not found.');
  }

  let resolvedDeliveryAddressId = deliveryAddressId;
  if (resolvedDeliveryAddressId) {
    const deliveryAddress = await db('addresses').where({ id: resolvedDeliveryAddressId }).first();
    if (!deliveryAddress || deliveryAddress.user_id !== customerId) {
      throw new ApiError(404, 'Delivery address not found.');
    }
  } else {
    resolvedDeliveryAddressId = pickupAddressId;
  }

  const activeZones = await db('service_zones').where({ active: true });
  const inZone = activeZones.some((zone) => isPointInZone(pickupAddress.lat, pickupAddress.lng, zone.polygon));
  if (!inZone) {
    throw new ApiError(400, 'Sorry, we do not currently deliver to this address.');
  }

  let totalPrice = 0;
  const pricedItems = [];

  for (const item of items) {
    const catalogEntry = await db('service_catalog')
      .where({ item_type: item.itemType, service_type: serviceType, active: true })
      .first();

    if (!catalogEntry) {
      throw new ApiError(400, `"${item.itemType}" is not available for ${serviceType}.`);
    }

    totalPrice += Number(catalogEntry.price) * item.quantity;
    pricedItems.push({
      description: `${item.quantity}x ${item.itemType}`,
      quantity: item.quantity,
      item_price: catalogEntry.price,
    });
  }

  const order = await db.transaction(async (trx) => {
    const [newOrder] = await trx('orders')
      .insert({
        customer_id: customerId,
        pickup_address_id: pickupAddressId,
        delivery_address_id: resolvedDeliveryAddressId,
        current_status: 'order_placed',
        service_type: serviceType,
        price: totalPrice,
        payment_status: 'pending',
        scheduled_pickup_window: `[${scheduledPickupStart}, ${scheduledPickupEnd})`,
        idempotency_key: idempotencyKey || null,
      })
      .returning('*');

    const itemsToInsert = pricedItems.map((item) => ({ ...item, order_id: newOrder.id }));
    await trx('order_items').insert(itemsToInsert);

    await trx('order_status_history').insert({
      order_id: newOrder.id,
      from_status: null,
      to_status: 'order_placed',
      changed_by_type: 'customer',
      changed_by_id: customerId,
    });

    return newOrder;
  });

    return db('order_items').where({ order_id: order.id }).then((items) => formatOrder(order, items));
  // Note: for a fully accurate items array with real IDs, re-fetch — see below
}

export async function listOrders(customerId) {
  const orders = await db('orders').where({ customer_id: customerId }).orderBy('created_at', 'desc');
  return orders.map((o) => formatOrder(o));
}

export async function getOrderById(customerId, orderId) {
  const order = await db('orders').where({ id: orderId }).first();
  if (!order) throw new ApiError(404, 'Order not found.');
  if (order.customer_id !== customerId) throw new ApiError(403, 'You do not have permission to view this order.');

  const items = await db('order_items').where({ order_id: orderId });
  return formatOrder(order, items);
}

export async function getOrderHistory(customerId, orderId) {
  const order = await db('orders').where({ id: orderId }).first();
  if (!order) throw new ApiError(404, 'Order not found.');
  if (order.customer_id !== customerId) throw new ApiError(403, 'You do not have permission to view this order.');

  const history = await db('order_status_history').where({ order_id: orderId }).orderBy('created_at', 'asc');
  return history.map(formatHistoryEntry);
}

const CANCELLABLE_STATUSES = ['order_placed', 'rider_assigned'];

export async function cancelOrder(customerId, orderId) {
  const order = await db('orders').where({ id: orderId }).first();
  if (!order) throw new ApiError(404, 'Order not found.');
  if (order.customer_id !== customerId) throw new ApiError(403, 'You do not have permission to cancel this order.');
  if (!CANCELLABLE_STATUSES.includes(order.current_status)) {
    throw new ApiError(400, `Order cannot be cancelled once it has reached "${order.current_status}".`);
  }

  const updatedOrder = await db.transaction(async (trx) => {
    const [updated] = await trx('orders')
      .where({ id: orderId })
      .update({ current_status: 'cancelled', updated_at: new Date() })
      .returning('*');

    await trx('order_status_history').insert({
      order_id: orderId,
      from_status: order.current_status,
      to_status: 'cancelled',
      changed_by_type: 'customer',
      changed_by_id: customerId,
    });

    return updated;
  });

  const items = await db('order_items').where({ order_id: orderId });
  return formatOrder(updatedOrder, items);
}