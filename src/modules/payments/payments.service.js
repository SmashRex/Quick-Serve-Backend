import crypto from 'crypto';
import db from '../../config/db.js';
import ApiError from '../../utils/ApiError.js';
import { initializeTransaction } from '../../utils/paystackClient.js';
import { formatPayment } from '../../utils/formatters.js';

const UNPAYABLE_STATUSES = ['cancelled', 'delivered'];

export async function initiatePayment(customerId, orderId) {
  const order = await db('orders').where({ id: orderId }).first();
  if (!order) throw new ApiError(404, 'Order not found.');
  if (order.customer_id !== customerId) {
    throw new ApiError(403, 'You do not have permission to pay for this order.');
  }
  if (UNPAYABLE_STATUSES.includes(order.current_status)) {
    throw new ApiError(400, `This order cannot be paid for — it is "${order.current_status}".`);
  }
  if (order.payment_status === 'paid') {
    throw new ApiError(400, 'This order has already been paid for.');
  }

  const customer = await db('users').where({ id: customerId }).first();
  if (!customer) throw new ApiError(404, 'Customer account not found.');

  // Reference must be unique per attempt — order id + random suffix guards against
  // any timing collision if this route is somehow called twice in the same millisecond.
  const reference = `QS-${order.id}-${crypto.randomUUID().slice(0, 8)}`;

  // Insert the payment row BEFORE calling Paystack. If the Paystack call fails or
  // times out below, we still have a record that an attempt was made — nothing
  // is lost, and it can be reconciled later instead of vanishing silently.
  const [payment] = await db('payments')
    .insert({
      order_id: order.id,
      amount: order.price,
      provider: 'paystack',
      provider_ref: reference,
      status: 'pending',
    })
    .returning('*');

  // Paystack expects amount in kobo (smallest currency unit) — this is the ONLY
  // place in the app this conversion happens.
  const amountKobo = Math.round(Number(order.price) * 100);

  const paystackResult = await initializeTransaction({
    email: customer.email,
    amountKobo,
    reference,
  });

  return {
    payment: formatPayment(payment),
    authorizationUrl: paystackResult.authorizationUrl,
  };
}

export async function handleWebhookEvent(event) {
  if (event.event !== 'charge.success') {
    // Not an event type we handle yet — acknowledge and do nothing.
    return { handled: false };
  }

  const reference = event.data.reference;

  const payment = await db('payments').where({ provider_ref: reference }).first();
  if (!payment) {
    // Reference doesn't match anything we created — log and move on rather than
    // throwing, since throwing here would make Paystack retry a webhook we can
    // never successfully process.
    console.warn(`Webhook received for unknown payment reference: ${reference}`);
    return { handled: false };
  }

  if (payment.status === 'success') {
    // Already processed — Paystack can send duplicate webhooks for the same event.
    // Returning early here makes this handler safely idempotent.
    return { handled: true, alreadyProcessed: true };
  }

  await db.transaction(async (trx) => {
    await trx('payments')
      .where({ id: payment.id })
      .update({ status: 'success', updated_at: new Date() });

    await trx('orders')
      .where({ id: payment.order_id })
      .update({ payment_status: 'paid', updated_at: new Date() });
  });

  return { handled: true, alreadyProcessed: false };
}

export async function getPaymentStatus(customerId, orderId) {
  const order = await db('orders').where({ id: orderId }).first();
  if (!order) throw new ApiError(404, 'Order not found.');
  if (order.customer_id !== customerId) {
    throw new ApiError(403, 'You do not have permission to view this order.');
  }

  const latestPayment = await db('payments')
    .where({ order_id: orderId })
    .orderBy('created_at', 'desc')
    .first();

  return {
    orderPaymentStatus: order.payment_status,
    latestPayment: latestPayment ? formatPayment(latestPayment) : null,
  };
}