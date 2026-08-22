import { Router } from 'express';
import authenticate from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import  validate  from '../../middleware/validate.js';
import { approveSchema, updatePartnerSchema } from './adminPartners.validation.js';
import * as adminPartnersController from './adminPartners.controller.js';



const router = Router();

router.post(
  '/admin/partners/:id/approve',
  authenticate,
  authorize('admin'),
  validate(approveSchema),
  adminPartnersController.approve
);
router.get('/admin/partners', authenticate, authorize('admin'), adminPartnersController.list);
router.get('/admin/partners/:id', authenticate, authorize('admin'), adminPartnersController.getById);
router.put(
  '/admin/partners/:id',
  authenticate,
  authorize('admin'),
  validate(updatePartnerSchema),
  adminPartnersController.update
);

export default router;