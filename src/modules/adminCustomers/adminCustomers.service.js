import db from '../../config/db.js';
import { formatUser } from '../../utils/formatters.js';

export async function getCustomers({ search, page = 1, limit = 20 }) {
  const query = db('users');

  if (search) {
    query.where(function () {
      this.whereILike('full_name', `%${search}%`).orWhereILike('email', `%${search}%`);
    });
  }

  // Clone before pagination so the count reflects the same filters, not the paginated slice.
  const countQuery = query.clone();
  const [{ count }] = await countQuery.count('id as count');
  const total = Number(count);

  const offset = (page - 1) * limit;
  const users = await query
    .select('users.*')
    .select(
      db('orders')
        .count('*')
        .whereRaw('orders.customer_id = users.id')
        .as('order_count')
    )
    .orderBy('created_at', 'desc')
    .limit(limit)
    .offset(offset);

  return {
    data: users.map((u) => ({
      ...formatUser(u),
      totalOrders: Number(u.order_count),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}