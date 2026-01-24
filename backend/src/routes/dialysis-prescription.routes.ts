import { Router } from 'express';
import {
    createDialysisPrescription,
    deleteDialysisPrescription,
    getDialysisPrescriptionById,
    getDialysisPrescriptions,
    updateDialysisPrescription,
} from '../controllers/dialysis-prescription.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
    createDialysisPrescriptionSchema,
    updateDialysisPrescriptionSchema,
} from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getDialysisPrescriptions);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createDialysisPrescriptionSchema),
    createDialysisPrescription
);
router.get('/:id', getDialysisPrescriptionById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateDialysisPrescriptionSchema),
    updateDialysisPrescription
);
router.delete('/:id', authorize('ADMIN'), deleteDialysisPrescription);

export default router;
