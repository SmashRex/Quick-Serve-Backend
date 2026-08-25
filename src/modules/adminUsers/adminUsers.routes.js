import { Router } from 'express';
import authenticate from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { authorizeTier } from '../../middleware/authorizeTier.js';
import validate from '../../middleware/validate.js';
import { createAdminSchema } from './adminUsers.validation.js';
import * as adminUsersController from './adminUsers.controller.js';

const router = Router();

router.post(
  '/admin/admin-users',
  authenticate,
  authorize('admin'),
  authorizeTier('super_admin'),
  validate(createAdminSchema),
  adminUsersController.create
);

export default router;