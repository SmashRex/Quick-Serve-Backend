import { Router } from 'express';
import authenticate from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import  validate  from '../../middleware/validate.js';
import { approveSchema } from './adminPartners.validation.js';
import * as adminPartnersController from './adminPartners.controller.js';

const router = Router();

router.post(
  '/admin/partners/:id/approve',
  authenticate,
  authorize('admin'),
  validate(approveSchema),
  adminPartnersController.approve
);

export default router;