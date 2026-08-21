import { Router } from 'express';
import authenticate from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import validate from '../../middleware/validate.js';
import { assignRiderSchema, assignPartnerSchema } from './adminOrders.validation.js';
import * as adminOrdersController from './adminOrders.controller.js';


const router = Router();

router.post(
  '/admin/orders/:id/assign-rider',
  authenticate,
  authorize('admin'),
  validate(assignRiderSchema),
  adminOrdersController.assignRider
);



router.post(
  '/admin/orders/:id/assign-partner',
  authenticate,
  authorize('admin'),
  validate(assignPartnerSchema),
  adminOrdersController.assignPartner
);

router.get('/admin/orders/breaches', authenticate, authorize('admin'), adminOrdersController.getBreaches);

export default router;