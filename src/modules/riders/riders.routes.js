import { Router } from 'express';
import authenticate from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import  validate  from '../../middleware/validate.js';
import { createRiderSchema } from './riders.validation.js';
import * as ridersController from './riders.controller.js';

const router = Router();

router.post('/admin/riders', authenticate, authorize('admin'), validate(createRiderSchema), ridersController.createRider);
router.get('/admin/riders', authenticate, authorize('admin'), ridersController.getRiders);
export default router;