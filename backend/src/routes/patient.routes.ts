import { Router } from 'express';
import {
    createPatient,
    getPatients,
    getPatientById,
    updatePatient,
    deletePatient,
    getMedicalHistory,
    addMedicalHistory,
    getPatientStats,
} from '../controllers/patient.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
    createPatientSchema,
    updatePatientSchema,
    createMedicalHistorySchema,
} from '../utils/validators';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Stats route (must be before /:id to avoid conflict)
router.get('/stats', getPatientStats);

// Patient CRUD
router.get('/', getPatients);
router.post('/', authorize('ADMIN', 'RECEPTIONIST'), validate(createPatientSchema), createPatient);
router.get('/:id', getPatientById);
router.put('/:id', authorize('ADMIN', 'RECEPTIONIST'), validate(updatePatientSchema), updatePatient);
router.delete('/:id', authorize('ADMIN'), deletePatient);

// Medical History
router.get('/:id/history', authorize('ADMIN', 'DOCTOR', 'NURSE'), getMedicalHistory);
router.post(
    '/:id/history',
    authorize('DOCTOR'),
    validate(createMedicalHistorySchema),
    addMedicalHistory
);

export default router;
