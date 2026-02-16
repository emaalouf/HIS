import { Router } from 'express';
import {
    createNeurologyEeg,
    deleteNeurologyEeg,
    getNeurologyEegById,
    getNeurologyEegs,
    updateNeurologyEeg,
} from '../controllers/neurology-eeg.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createNeurologyEegSchema, updateNeurologyEegSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getNeurologyEegs);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createNeurologyEegSchema),
    createNeurologyEeg
);
router.get('/:id', getNeurologyEegById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateNeurologyEegSchema),
    updateNeurologyEeg
);
router.delete('/:id', authorize('ADMIN'), deleteNeurologyEeg);

export default router;
