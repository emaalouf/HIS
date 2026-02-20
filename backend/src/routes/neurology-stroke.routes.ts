import { Router } from 'express';
import {
    createNeurologyStroke,
    deleteNeurologyStroke,
    getNeurologyStrokeById,
    getNeurologyStrokes,
    updateNeurologyStroke,
} from '../controllers/neurology-stroke.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createNeurologyStrokeSchema, updateNeurologyStrokeSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getNeurologyStrokes);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createNeurologyStrokeSchema),
    createNeurologyStroke
);
router.get('/:id', getNeurologyStrokeById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateNeurologyStrokeSchema),
    updateNeurologyStroke
);
router.delete('/:id', authorize('ADMIN'), deleteNeurologyStroke);

export default router;
