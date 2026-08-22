import { Router } from 'express';
import authenticate from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { authorizeTier } from '../../middleware/authorizeTier.js';
import * as adminPayoutsController from './adminPayouts.controller.js';

const router = Router();

router.get('/admin/payouts', authenticate, authorize('admin'), adminPayoutsController.list);

router.put(
  '/admin/payouts/:id/mark-paid',
  authenticate,
  authorize('admin'),
  authorizeTier('finance', 'super_admin'),
  adminPayoutsController.markPaid
);

export default router;