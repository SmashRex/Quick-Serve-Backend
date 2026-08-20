import { Router } from 'express';
import authenticate from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import validate from '../../middleware/validate.js';
import { assignRiderSchema } from './adminOrders.validation.js';
import * as adminOrdersController from './adminOrders.controller.js';

const router = Router();

router.post(
  '/admin/orders/:id/assign-rider',
  authenticate,
  authorize('admin'),
  validate(assignRiderSchema),
  adminOrdersController.assignRider
);

export default router;