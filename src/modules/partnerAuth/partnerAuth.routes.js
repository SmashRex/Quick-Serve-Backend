import { Router } from 'express';
import  validate from '../../middleware/validate.js';
import { onboardSchema, loginSchema } from './partnerAuth.validation.js';
import * as partnerAuthController from './partnerAuth.controller.js';


const router = Router();

router.post('/partner/onboarding', validate(onboardSchema), partnerAuthController.onboard);
router.get('/partner-auth/verify', partnerAuthController.verify);
router.post('/partner-auth/login', validate(loginSchema), partnerAuthController.login);

export default router;