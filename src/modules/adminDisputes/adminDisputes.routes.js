import { Router } from 'express';
import authenticate from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import validate from '../../middleware/validate.js';
import { resolveSchema } from './adminDisputes.validation.js';
import * as adminDisputesController from './adminDisputes.controller.js';

const router = Router();

router.get('/admin/disputes', authenticate, authorize('admin'), adminDisputesController.list);
router.get('/admin/disputes/:id', authenticate, authorize('admin'), adminDisputesController.getById);
router.put(
  '/admin/disputes/:id/resolve',
  authenticate,
  authorize('admin'),
  validate(resolveSchema),
  adminDisputesController.resolve
);

export default router;