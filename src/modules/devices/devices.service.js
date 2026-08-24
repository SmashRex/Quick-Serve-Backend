import db from '../../config/db.js';

export async function registerDevice(ownerType, ownerId, pushToken, platform) {
  // Upsert: if this exact token already exists (e.g. re-registering, or a
  // different account now using the same physical device), update who owns
  // it rather than throwing a unique-constraint error.
  const existing = await db('device_tokens').where({ push_token: pushToken }).first();

  if (existing) {
    const [updated] = await db('device_tokens')
      .where({ id: existing.id })
      .update({ owner_type: ownerType, owner_id: ownerId, platform: platform || null, updated_at: new Date() })
      .returning('*');
    return formatDeviceToken(updated);
  }

  const [created] = await db('device_tokens')
    .insert({ owner_type: ownerType, owner_id: ownerId, push_token: pushToken, platform: platform || null })
    .returning('*');
  return formatDeviceToken(created);
}

function formatDeviceToken(row) {
  return {
    id: row.id,
    ownerType: row.owner_type,
    platform: row.platform,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}