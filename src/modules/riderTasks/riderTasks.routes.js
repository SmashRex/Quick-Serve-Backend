import { Router } from 'express';
import authenticate from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import * as riderTasksController from './riderTasks.controller.js';
import validate from '../../middleware/validate.js';
import { updateStatusSchema, updateAvailabilitySchema } from './riderTasks.validation.js';
import multer from 'multer';



const router = Router();

router.post(
  '/rider/tasks/:orderId/status',
  authenticate,
  authorize('rider'),
  validate(updateStatusSchema),
  riderTasksController.updateStatus
);


const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB cap

router.post(
  '/rider/tasks/:orderId/proof',
  authenticate,
  authorize('rider'),
  upload.single('photo'),
  riderTasksController.uploadProof
);


router.get('/rider/tasks', authenticate, authorize('rider'), riderTasksController.getTasks);


router.put(
  '/rider/status',
  authenticate,
  authorize('rider'),
  validate(updateAvailabilitySchema),
  riderTasksController.updateAvailability
);

export default router;