import { Router } from 'express';
import * as authController from './auth.controller.js';
import validate from '../../middleware/validate.js';
import { signupSchema } from './auth.validation.js';
import { loginSchema } from './auth.validation.js';
import authenticate from '../../middleware/authenticate.js';
import { refreshSchema } from './auth.validation.js';


const router = Router();



router.post('/refresh', validate(refreshSchema), authController.refresh);
router.get('/me', authenticate, authController.me);
router.post('/signup', validate(signupSchema), authController.signup);
router.get('/verify', authController.verifyEmail);
router.post('/logout', authenticate, authController.logout);
router.post('/login', validate(loginSchema), authController.login);

export default router;
