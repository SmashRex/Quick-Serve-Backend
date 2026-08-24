import { Router } from 'express';
import authenticate from '../../middleware/authenticate.js';
import * as notificationsController from './notifications.controller.js';

const router = Router();

router.get('/notifications', authenticate, notificationsController.list);
router.put('/notifications/:id/read', authenticate, notificationsController.markRead);

export default router;