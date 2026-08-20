import db from '../config/db.js';
import ApiError from '../utils/ApiError.js';

// Maps a JWT role to the allowed_actor string(s) it satisfies in order_transitions.
// This exists because the seeded data encodes richer business meaning
// ("ops or an automated system") than a single JWT role string does —
// see order_transitions table: allowed_actor uses 'ops', 'ops/system',
// 'rider', 'partner'.
const ROLE_ALIASES = {
  admin: ['ops', 'ops/system'],
  rider: ['rider'],
  partner: ['partner'],
};

/**
 * Checks whether a transition from `fromStatus` to `toStatus` is allowed,
 * AND that `actorRole` (the JWT role of whoever is making the request) is
 * permitted to make that specific transition.
 * Throws ApiError(400) if the transition itself doesn't exist in the table.
 * Throws ApiError(403) if the transition exists but this actor can't do it.
 * Returns undefined (no error) if valid.
 *
 * Does NOT handle cancelled/disputed — those are explicit service-layer logic
 * elsewhere (see orders.service.js cancelOrder), by design, since they don't
 * fit this table's row-per-transition shape.
 */
export async function assertValidTransition(fromStatus, toStatus, actorRole) {
  const rule = await db('order_transitions')
    .where({ from_status: fromStatus, to_status: toStatus })
    .first();

  if (!rule) {
    throw new ApiError(
      400,
      `Cannot transition order from "${fromStatus}" to "${toStatus}" — not a valid transition.`
    );
  }

  const allowedRoles = ROLE_ALIASES[actorRole] || [];
  if (!allowedRoles.includes(rule.allowed_actor)) {
    throw new ApiError(
      403,
      `Only "${rule.allowed_actor}" can perform the transition from "${fromStatus}" to "${toStatus}".`
    );
  }
}