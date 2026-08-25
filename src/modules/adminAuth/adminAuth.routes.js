import { Router } from 'express';
import validate  from '../../middleware/validate.js';
import { loginSchema } from './adminAuth.validation.js';
import * as adminAuthController from './adminAuth.controller.js';
import { loginLimiter } from '../../middleware/rateLimiters.js';



const router = Router();

router.post('/admin-auth/login', loginLimiter, validate(loginSchema), adminAuthController.login);


export default router;