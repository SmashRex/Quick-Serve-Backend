import { Router } from 'express';
import authenticate from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import validate from '../../middleware/validate.js';
import { assignRiderSchema, assignPartnerSchema } from './adminOrders.validation.js';
import * as adminOrdersController from './adminOrders.controller.js';
import * as messagesController from '../messages/messages.controller.js';



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
router.get('/admin/orders', authenticate, authorize('admin'), adminOrdersController.getOrders);
router.get('/admin/orders/:id/proof-photos', authenticate, authorize('admin'), adminOrdersController.getProofPhotos);

router.get('/admin/orders/:id/messages', authenticate, authorize('admin'), messagesController.getBothThreads);



export default router;