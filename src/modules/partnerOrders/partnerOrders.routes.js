import { Router } from 'express';
import authenticate from '../../middleware/authenticate.js';
import  {authorize}  from '../../middleware/authorize.js';
import * as partnerOrdersController from './partnerOrders.controller.js';
import {updateStatusSchema} from './partnerOrders.validation.js';
import validate from '../../middleware/validate.js';


const router = Router();

router.get('/partner/orders', authenticate, authorize('partner'), partnerOrdersController.getOrders);
router.post('/partner/orders/:id/accept', authenticate, authorize('partner'), partnerOrdersController.accept);
router.get('/partner/orders/:id/sla', authenticate, authorize('partner'), partnerOrdersController.getSla);

router.post(
  '/partner/orders/:id/status',
  authenticate,
  authorize('partner'),
  validate(updateStatusSchema),
  partnerOrdersController.updateStatus
);

export default router;