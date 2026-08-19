import db from '../../config/db.js';
import ApiError from '../../utils/ApiError.js';
import { formatAddress } from '../../utils/formatters.js';

export async function createAddress(userId, data) {
  const [address] = await db('addresses').insert({ user_id: userId, ...data }).returning('*');
  return formatAddress(address);
}

export async function listAddresses(userId) {
  const addresses = await db('addresses').where({ user_id: userId }).orderBy('created_at', 'desc');
  return addresses.map(formatAddress);
}

export async function updateAddress(userId, addressId, data) {
  const existing = await db('addresses').where({ id: addressId }).first();
  if (!existing) throw new ApiError(404, 'Address not found.');
  if (existing.user_id !== userId) throw new ApiError(403, 'You do not have permission to edit this address.');

  const [updated] = await db('addresses')
    .where({ id: addressId })
    .update({ ...data, updated_at: new Date() })
    .returning('*');

  return formatAddress(updated);
}

export async function deleteAddress(userId, addressId) {
  const existing = await db('addresses').where({ id: addressId }).first();
  if (!existing) throw new ApiError(404, 'Address not found.');
  if (existing.user_id !== userId) throw new ApiError(403, 'You do not have permission to delete this address.');

  const linkedOrder = await db('orders')
    .where({ pickup_address_id: addressId })
    .orWhere({ delivery_address_id: addressId })
    .first();

  if (linkedOrder) {
    throw new ApiError(400, 'This address is linked to an existing order and cannot be deleted.');
  }

  await db('addresses').where({ id: addressId }).del();
  return { message: 'Address deleted.' };
}