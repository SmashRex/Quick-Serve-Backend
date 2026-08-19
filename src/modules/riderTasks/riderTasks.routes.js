import { Router } from 'express';
import authenticate from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import * as riderTasksController from './riderTasks.controller.js';

const router = Router();

router.get('/rider/tasks', authenticate, authorize('rider'), riderTasksController.getTasks);

export default router;