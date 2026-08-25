import { Router } from 'express';
import  validate  from '../../middleware/validate.js';
import { loginSchema } from './riderAuth.validation.js';
import * as riderAuthController from './riderAuth.controller.js';
import { loginLimiter } from '../../middleware/rateLimiters.js';



const router = Router();

router.post('/rider-auth/login', loginLimiter, validate(loginSchema), riderAuthController.login);

export default router;