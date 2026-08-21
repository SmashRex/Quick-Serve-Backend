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

export async function updateOrderStatus(riderId, orderId, toStatus) {
  const order = await db('orders').where({ id: orderId }).first();
  if (!order) throw new ApiError(404, 'Order not found.');

  const ownershipColumn = STATUS_ASSIGNMENT_OWNERSHIP[toStatus];
  if (!ownershipColumn) {
    // toStatus isn't one of the rider-drivable statuses at all — let
    // assertValidTransition below produce the real error, since it's the
    // single source of truth for "what's a valid transition."
  } else if (order[ownershipColumn] !== riderId) {
    throw new ApiError(403, 'You are not the assigned rider for this part of the order.');
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

    return updated;
  });

  const items = await db('order_items').where({ order_id: orderId });
  return formatOrder(updatedOrder, items);
}



const PHOTO_REQUIRED_FOR = {
  at_hub: 'pickup_photo_url',
  delivered: 'delivery_photo_url',
};

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

  const url = await saveFile(fileBuffer, originalFilename);

  // Which column to write depends on which assignment this rider is on, not on the
  // order's current status — a pickup rider always writes pickup_photo_url.
  const column = isPickupAssignment ? 'pickup_photo_url' : 'delivery_photo_url';

  const [updatedItem] = await db('order_items')
    .where({ id: itemId })
    .update({ [column]: url, updated_at: new Date() })
    .returning('*');

  return { itemId: updatedItem.id, [column === 'pickup_photo_url' ? 'pickupPhotoUrl' : 'deliveryPhotoUrl']: url };
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