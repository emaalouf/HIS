import { Router } from 'express';
import {
    createDialysisMedication,
    deleteDialysisMedication,
    getDialysisMedicationById,
    getDialysisMedications,
    updateDialysisMedication,
} from '../controllers/dialysis-medication.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createDialysisMedicationSchema, updateDialysisMedicationSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getDialysisMedications);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createDialysisMedicationSchema),
    createDialysisMedication
);
router.get('/:id', getDialysisMedicationById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateDialysisMedicationSchema),
    updateDialysisMedication
);
router.delete('/:id', authorize('ADMIN'), deleteDialysisMedication);

export default router;
