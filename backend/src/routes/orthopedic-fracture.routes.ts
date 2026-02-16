import { Router } from 'express';
import {
    createOrthopedicFracture,
    deleteOrthopedicFracture,
    getOrthopedicFractureById,
    getOrthopedicFractures,
    updateOrthopedicFracture,
} from '../controllers/orthopedic-fracture.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createOrthopedicFractureSchema, updateOrthopedicFractureSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getOrthopedicFractures);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createOrthopedicFractureSchema),
    createOrthopedicFracture
);
router.get('/:id', getOrthopedicFractureById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateOrthopedicFractureSchema),
    updateOrthopedicFracture
);
router.delete('/:id', authorize('ADMIN'), deleteOrthopedicFracture);

export default router;
