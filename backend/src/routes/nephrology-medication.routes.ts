import { Router } from 'express';
import {
    createNephrologyMedication,
    deleteNephrologyMedication,
    getNephrologyMedicationById,
    getNephrologyMedications,
    updateNephrologyMedication,
} from '../controllers/nephrology-medication.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createNephrologyMedicationSchema, updateNephrologyMedicationSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getNephrologyMedications);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createNephrologyMedicationSchema),
    createNephrologyMedication
);
router.get('/:id', getNephrologyMedicationById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateNephrologyMedicationSchema),
    updateNephrologyMedication
);
router.delete('/:id', authorize('ADMIN'), deleteNephrologyMedication);

export default router;
