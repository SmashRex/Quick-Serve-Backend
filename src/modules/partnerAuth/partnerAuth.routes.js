import { Router } from 'express';
import  validate from '../../middleware/validate.js';
import { onboardSchema } from './partnerAuth.validation.js';
import * as partnerAuthController from './partnerAuth.controller.js';

const router = Router();

router.post('/partner/onboarding', validate(onboardSchema), partnerAuthController.onboard);
router.get('/partner-auth/verify', partnerAuthController.verify);

export default router;