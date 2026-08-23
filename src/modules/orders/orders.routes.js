import { Router } from 'express';
import * as ordersController from './orders.controller.js';
import validate from '../../middleware/validate.js';
import authenticate from '../../middleware/authenticate.js';
import { createOrderSchema } from './orders.validation.js';
import { createDisputeSchema } from './disputes.validation.js';
import * as disputesController from './disputes.controller.js';
import { postMessageSchema } from '../messages/messages.validation.js';
import * as messagesController from '../messages/messages.controller.js';

const router = Router();
router.use(authenticate);

router.post('/:id/dispute', validate(createDisputeSchema), disputesController.createDispute);
router.post('/', validate(createOrderSchema), ordersController.create);
router.get('/', ordersController.list);
router.get('/:id', ordersController.getById);
router.get('/:id/history', ordersController.getHistory);
router.post('/:id/cancel', ordersController.cancel);
router.get('/:id/messages', messagesController.getThreadAsCustomer);
router.post('/:id/messages', validate(postMessageSchema), messagesController.postMessageAsCustomer);

export default router;
