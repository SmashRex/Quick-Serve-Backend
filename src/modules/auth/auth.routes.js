import { Router } from 'express';
import * as authController from './auth.controller.js';
import validate from '../../middleware/validate.js';
import { signupSchema } from './auth.validation.js';
import { loginSchema } from './auth.validation.js';
import authenticate from '../../middleware/authenticate.js';
import { refreshSchema } from './auth.validation.js';
import { forgotPasswordSchema, resetPasswordSchema } from './passwordReset.validation.js';
import * as passwordResetController from './passwordReset.controller.js';
import { loginLimiter, signupLimiter, forgotPasswordLimiter } from '../../middleware/rateLimiters.js';






const router = Router();



router.post('/refresh', validate(refreshSchema), authController.refresh);
router.get('/me', authenticate, authController.me);
router.get('/verify', authController.verifyEmail);
router.post('/logout', authenticate, authController.logout);
router.post('/auth/reset-password', validate(resetPasswordSchema), passwordResetController.resetPassword);
router.post('/auth/signup', signupLimiter, validate(signupSchema), authController.signup);
router.post('/auth/login', loginLimiter, validate(loginSchema), authController.login);
router.post('/auth/forgot-password', forgotPasswordLimiter, validate(forgotPasswordSchema), passwordResetController.forgotPasswordCustomer);

export default router;
