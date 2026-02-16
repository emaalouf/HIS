import { Router } from 'express';
import {
    createInsulinPrescription,
    deleteInsulinPrescription,
    getInsulinPrescriptionById,
    getInsulinPrescriptions,
    updateInsulinPrescription,
} from '../controllers/endocrinology-insulin.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createEndocrinologyInsulinSchema, updateEndocrinologyInsulinSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getInsulinPrescriptions);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createEndocrinologyInsulinSchema),
    createInsulinPrescription
);
router.get('/:id', getInsulinPrescriptionById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateEndocrinologyInsulinSchema),
    updateInsulinPrescription
);
router.delete('/:id', authorize('ADMIN'), deleteInsulinPrescription);

export default router;
