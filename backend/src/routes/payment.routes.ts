import { Router } from 'express';
import {
    createPayment,
    deletePayment,
    getPaymentById,
    getPayments,
    updatePayment,
} from '../controllers/payment.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createPaymentSchema, updatePaymentSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getPayments);
router.post('/', authorize('ADMIN', 'RECEPTIONIST'), validate(createPaymentSchema), createPayment);
router.get('/:id', getPaymentById);
router.put('/:id', authorize('ADMIN', 'RECEPTIONIST'), validate(updatePaymentSchema), updatePayment);
router.delete('/:id', authorize('ADMIN'), deletePayment);

export default router;
