import * as paymentsService from './payments.service.js';
import { verifyWebhookSignature } from '../../utils/paystackClient.js';
import crypto from 'crypto';

export async function initiatePayment(req, res, next) {
  try {
    const result = await paymentsService.initiatePayment(req.user.id, req.params.id);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}



export async function webhook(req, res, next) {
  try {
   

// ...inside webhook(), near your existing debug logs:
console.log('--- SECRET KEY FINGERPRINT (server) ---');
console.log(crypto.createHash('sha256').update(process.env.PAYSTACK_SECRET_KEY).digest('hex').slice(0, 12));
    const signature = req.headers['x-paystack-signature'];

    if (!signature || !verifyWebhookSignature(req.body, signature)) {
      // req.body here is the raw Buffer, thanks to the express.raw() middleware
      // scoped to this path in app.js.
      return res.status(401).json({ message: 'Invalid signature', error: 'Unauthorized', statusCode: 401 });
    }

    const event = JSON.parse(req.body.toString('utf8'));
    await paymentsService.handleWebhookEvent(event);

    // Always respond 200 once signature is valid and we've processed (or
    // deliberately ignored) the event — this stops Paystack from retrying.
    res.status(200).json({ received: true });
  } catch (err) {
    next(err);
  }
}

export async function getPaymentStatus(req, res, next) {
  try {
    const result = await paymentsService.getPaymentStatus(req.user.id, req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}