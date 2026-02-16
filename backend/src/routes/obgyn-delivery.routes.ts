import { Router } from 'express';
import {
    createObgynDelivery,
    deleteObgynDelivery,
    getObgynDeliveryById,
    getObgynDeliveries,
    updateObgynDelivery,
} from '../controllers/obgyn-delivery.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createObgynDeliverySchema, updateObgynDeliverySchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getObgynDeliveries);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createObgynDeliverySchema),
    createObgynDelivery
);
router.get('/:id', getObgynDeliveryById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateObgynDeliverySchema),
    updateObgynDelivery
);
router.delete('/:id', authorize('ADMIN'), deleteObgynDelivery);

export default router;
