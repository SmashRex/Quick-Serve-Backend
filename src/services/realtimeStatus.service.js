import { firestoreDb } from '../config/firebase.js';

/**
 * Writes the current order status to Firestore so subscribed clients get a
 * live update without polling. Failure here should NOT fail the whole
 * request — if Firestore is down, the order status change in Postgres is
 * still the source of truth and must succeed regardless.
 */
export async function writeOrderStatusRealtime(orderId, status) {
  try {
    await firestoreDb.collection('orderStatus').doc(orderId).set({
      status,
      updatedAt: Date.now(),
    });
  } catch (err) {
    console.error(`Failed to write realtime status for order ${orderId}:`, err.message);
  }
}