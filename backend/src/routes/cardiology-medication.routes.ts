import { Router } from 'express';
import {
    createCardiologyMedication,
    deleteCardiologyMedication,
    getCardiologyMedicationById,
    getCardiologyMedications,
    updateCardiologyMedication,
} from '../controllers/cardiology-medication.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createCardiologyMedicationSchema, updateCardiologyMedicationSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getCardiologyMedications);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createCardiologyMedicationSchema),
    createCardiologyMedication
);
router.get('/:id', getCardiologyMedicationById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateCardiologyMedicationSchema),
    updateCardiologyMedication
);
router.delete('/:id', authorize('ADMIN'), deleteCardiologyMedication);

export default router;
