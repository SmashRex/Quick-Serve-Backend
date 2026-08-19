import db from '../../config/db.js';
import { formatOrder } from '../../utils/formatters.js';

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