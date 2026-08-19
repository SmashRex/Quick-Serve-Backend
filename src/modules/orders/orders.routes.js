import { Router } from 'express';
import * as ordersController from './orders.controller.js';
import validate from '../../middleware/validate.js';
import authenticate from '../../middleware/authenticate.js';
import { createOrderSchema } from './orders.validation.js';

const router = Router();
router.use(authenticate);

router.post('/', validate(createOrderSchema), ordersController.create);
router.get('/', ordersController.list);
router.get('/:id', ordersController.getById);
router.get('/:id/history', ordersController.getHistory);
router.post('/:id/cancel', ordersController.cancel);

export default router;