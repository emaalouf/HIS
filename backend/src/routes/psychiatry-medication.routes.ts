import { Router } from 'express';
import {
    createPsychiatryMedication,
    deletePsychiatryMedication,
    getPsychiatryMedicationById,
    getPsychiatryMedications,
    updatePsychiatryMedication,
} from '../controllers/psychiatry-medication.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createPsychiatryMedicationSchema, updatePsychiatryMedicationSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getPsychiatryMedications);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createPsychiatryMedicationSchema),
    createPsychiatryMedication
);
router.get('/:id', getPsychiatryMedicationById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updatePsychiatryMedicationSchema),
    updatePsychiatryMedication
);
router.delete('/:id', authorize('ADMIN'), deletePsychiatryMedication);

export default router;
