import { Router } from 'express';
import authenticate from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import * as adminCustomersController from './adminCustomers.controller.js';

const router = Router();

router.get('/admin/customers', authenticate, authorize('admin'), adminCustomersController.getCustomers);

export default router;