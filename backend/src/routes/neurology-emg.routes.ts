import { Router } from 'express';
import {
    createNeurologyEmg,
    deleteNeurologyEmg,
    getNeurologyEmgById,
    getNeurologyEmgs,
    updateNeurologyEmg,
} from '../controllers/neurology-emg.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createNeurologyEmgSchema, updateNeurologyEmgSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getNeurologyEmgs);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createNeurologyEmgSchema),
    createNeurologyEmg
);
router.get('/:id', getNeurologyEmgById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateNeurologyEmgSchema),
    updateNeurologyEmg
);
router.delete('/:id', authorize('ADMIN'), deleteNeurologyEmg);

export default router;
