import { Router } from 'express';
import authenticate from '../../middleware/authenticate.js';
import * as paymentsController from './payments.controller.js';

const router = Router();

router.post('/orders/:id/pay', authenticate, paymentsController.initiatePayment);
router.post('/payments/webhook', paymentsController.webhook);
router.get('/orders/:id/payment-status', authenticate, paymentsController.getPaymentStatus);

export default router;