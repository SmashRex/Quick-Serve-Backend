import { Router } from 'express';
import authenticate from '../../middleware/authenticate.js';
import validate from '../../middleware/validate.js';
import { registerDeviceSchema } from './devices.validation.js';
import * as devicesController from './devices.controller.js';

const router = Router();

router.post('/devices/register', authenticate, validate(registerDeviceSchema), devicesController.register);

export default router;