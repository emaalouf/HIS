import { Router } from 'express';
import {
    createClinicalOrder,
    deleteClinicalOrder,
    getClinicalOrderById,
    getClinicalOrders,
    updateClinicalOrder,
} from '../controllers/clinical-order.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createClinicalOrderSchema, updateClinicalOrderSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getClinicalOrders);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createClinicalOrderSchema),
    createClinicalOrder
);
router.get('/:id', getClinicalOrderById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateClinicalOrderSchema),
    updateClinicalOrder
);
router.delete('/:id', authorize('ADMIN'), deleteClinicalOrder);

export default router;
