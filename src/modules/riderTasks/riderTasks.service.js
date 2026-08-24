import db from '../../config/db.js';
import { formatOrder } from '../../utils/formatters.js';
import ApiError from '../../utils/ApiError.js';
import { assertValidTransition } from '../../services/orderTransitions.service.js';
import { saveFile } from '../../utils/cloudinaryStorage.js';

const TERMINAL_STATUSES = ['delivered', 'cancelled'];

export async function getRiderTasks(riderId) {
  const orders = await db('orders')
    .where(function () {
      this.where('pickup_rider_id', riderId).orWhere('delivery_rider_id', riderId);
    })
    .whereNotIn('current_status', TERMINAL_STATUSES)
    .orderBy('created_at', 'asc');

  return orders.map((o) => formatOrder(o));
}

// Maps a target status to which rider-assignment column must match the requesting rider.
const STATUS_ASSIGNMENT_OWNERSHIP = {
  picked_up: 'pickup_rider_id',
  at_hub: 'pickup_rider_id',
  returned_to_hub: 'delivery_rider_id',
  out_for_delivery: 'delivery_rider_id',
  delivered: 'delivery_rider_id',
};

const PHOTO_REQUIRED_FOR = {
  at_hub: 'pickup_photo_url',
  delivered: 'delivery_photo_url',
};

export async function updateOrderStatus(riderId, orderId, toStatus) {
  const order = await db('orders').where({ id: orderId }).first();
  if (!order) throw new ApiError(404, 'Order not found.');

  const ownershipColumn = STATUS_ASSIGNMENT_OWNERSHIP[toStatus];
  if (ownershipColumn && order[ownershipColumn] !== riderId) {
    throw new ApiError(403, 'You are not the assigned rider for this leg of the order.');
  }

  const fromStatus = order.current_status;

  await assertValidTransition(fromStatus, toStatus, 'rider');
  await assertProofRequirementMet(orderId, toStatus);

  const updatedOrder = await db.transaction(async (trx) => {
    const [updated] = await trx('orders')
      .where({ id: orderId })
      .update({ current_status: toStatus, updated_at: new Date() })
      .returning('*');

    await trx('order_status_history').insert({
      order_id: orderId,
      from_status: fromStatus,
      to_status: toStatus,
      changed_by_type: 'rider',
      changed_by_id: riderId,
    });

    // Auto-generate a pending payout the moment an order is delivered, since
    // the partner has now completed their part of the work. Only create it
    // if the order actually has a partner assigned — a payout with no
    // partner to pay doesn't make sense.
    if (toStatus === 'delivered' && order.partner_id) {
      await trx('partner_payouts').insert({
        partner_id: order.partner_id,
        order_id: orderId,
        amount: order.price,
        status: 'pending',
      });
    }

    return updated;
  });

  const items = await db('order_items').where({ order_id: orderId });
  return formatOrder(updatedOrder, items);
}

/**
 * Checks whether ALL items on the order have the required proof photo for
 * the given target status. Called from updateOrderStatus before allowing
 * a transition into at_hub or delivered.
 */
export async function assertProofRequirementMet(orderId, toStatus) {
  const requiredColumn = PHOTO_REQUIRED_FOR[toStatus];
  if (!requiredColumn) return; // no photo requirement for this transition

  const items = await db('order_items').where({ order_id: orderId });
  const missing = items.filter((item) => !item[requiredColumn]);

  if (missing.length > 0) {
    throw new ApiError(
      400,
      `Cannot advance to "${toStatus}" — ${missing.length} item(s) are missing required proof photos.`
    );
  }
}

const RIDER_STATUSES = ['offline', 'available', 'on_task'];

export async function updateRiderAvailability(riderId, newStatus) {
  const rider = await db('riders').where({ id: riderId }).first();
  if (!rider) throw new ApiError(404, 'Rider account not found.');

  const [updated] = await db('riders')
    .where({ id: riderId })
    .update({ status: newStatus, updated_at: new Date() })
    .returning('*');

  return {
    id: updated.id,
    status: updated.status,
    updatedAt: updated.updated_at,
  };
}

export async function uploadProof(riderId, orderId, itemId, fileBuffer, originalFilename) {
  const order = await db('orders').where({ id: orderId }).first();
  if (!order) throw new ApiError(404, 'Order not found.');

  const isPickupAssignment = order.pickup_rider_id === riderId;
  const isDeliveryAssignment = order.delivery_rider_id === riderId;
  if (!isPickupAssignment && !isDeliveryAssignment) {
    throw new ApiError(403, 'You are not an assigned rider for this order.');
  }

  const item = await db('order_items').where({ id: itemId, order_id: orderId }).first();
  if (!item) throw new ApiError(404, 'Order item not found on this order.');

  // Determine which leg's photo this upload is for based on the order's
  // current pipeline stage, not just rider identity — a rider can be
  // assigned to BOTH legs on the same order, so identity alone is
  // ambiguous. Delivery-stage statuses mean this upload is a delivery
  // photo; anything before that is a pickup photo.
  const DELIVERY_STAGE_STATUSES = ['returned_to_hub', 'out_for_delivery', 'delivered'];
  const isDeliveryStage = DELIVERY_STAGE_STATUSES.includes(order.current_status);

  if (isDeliveryStage && !isDeliveryAssignment) {
    throw new ApiError(403, 'You are not the assigned delivery rider for this order.');
  }
  if (!isDeliveryStage && !isPickupAssignment) {
    throw new ApiError(403, 'You are not the assigned pickup rider for this order.');
  }

  const url = await saveFile(fileBuffer, originalFilename);

  const column = isDeliveryStage ? 'delivery_photo_url' : 'pickup_photo_url';

  const [updatedItem] = await db('order_items')
    .where({ id: itemId })
    .update({ [column]: url, updated_at: new Date() })
    .returning('*');

  return { itemId: updatedItem.id, [column === 'pickup_photo_url' ? 'pickupPhotoUrl' : 'deliveryPhotoUrl']: url };
}
