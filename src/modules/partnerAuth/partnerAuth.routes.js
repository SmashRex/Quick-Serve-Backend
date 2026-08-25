import { Router } from 'express';
import  validate from '../../middleware/validate.js';
import { onboardSchema, loginSchema } from './partnerAuth.validation.js';
import * as partnerAuthController from './partnerAuth.controller.js';
import { forgotPasswordSchema } from '../auth/passwordReset.validation.js';
import * as passwordResetController from '../auth/passwordReset.controller.js';
import { loginLimiter, signupLimiter, forgotPasswordLimiter } from '../../middleware/rateLimiters.js';



const router = Router();



router.post('/partner/onboarding', signupLimiter, validate(onboardSchema), partnerAuthController.onboard);
router.post('/partner-auth/login', loginLimiter, validate(loginSchema), partnerAuthController.login);
router.post('/partner-auth/forgot-password', forgotPasswordLimiter, validate(forgotPasswordSchema), passwordResetController.forgotPasswordPartner);

router.get('/partner-auth/verify', partnerAuthController.verify);

export default router;