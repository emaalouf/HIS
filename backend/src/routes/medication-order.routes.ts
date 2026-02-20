import { Router } from 'express';
import {
    createMedicationOrder,
    deleteMedicationOrder,
    getMedicationOrderById,
    getMedicationOrders,
    updateMedicationOrder,
} from '../controllers/medication-order.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createMedicationOrderSchema, updateMedicationOrderSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getMedicationOrders);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createMedicationOrderSchema),
    createMedicationOrder
);
router.get('/:id', getMedicationOrderById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateMedicationOrderSchema),
    updateMedicationOrder
);
router.delete('/:id', authorize('ADMIN'), deleteMedicationOrder);

export default router;
