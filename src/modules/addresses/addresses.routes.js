import { Router } from 'express';
import * as addressesController from './addresses.controller.js';
import validate from '../../middleware/validate.js';
import authenticate from '../../middleware/authenticate.js';
import { createAddressSchema, updateAddressSchema } from './addresses.validation.js';

const router = Router();

router.use(authenticate); // every route in this file requires login

router.post('/', validate(createAddressSchema), addressesController.create);
router.get('/', addressesController.list);
router.put('/:id', validate(updateAddressSchema), addressesController.update);
router.delete('/:id', addressesController.remove);

export default router;