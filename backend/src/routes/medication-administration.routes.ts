import { Router } from 'express';
import {
    createMedicationAdministration,
    deleteMedicationAdministration,
    getMedicationAdministrationById,
    getMedicationAdministrations,
    updateMedicationAdministration,
} from '../controllers/medication-administration.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
    createMedicationAdministrationSchema,
    updateMedicationAdministrationSchema,
} from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getMedicationAdministrations);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createMedicationAdministrationSchema),
    createMedicationAdministration
);
router.get('/:id', getMedicationAdministrationById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateMedicationAdministrationSchema),
    updateMedicationAdministration
);
router.delete('/:id', authorize('ADMIN'), deleteMedicationAdministration);

export default router;
