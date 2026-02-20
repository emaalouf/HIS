import { Router } from 'express';
import {
    createSpirometryTest,
    deleteSpirometryTest,
    getSpirometryTestById,
    getSpirometryTests,
    updateSpirometryTest,
} from '../controllers/pulmonology-spirometry.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createPulmonologySpirometrySchema, updatePulmonologySpirometrySchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getSpirometryTests);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createPulmonologySpirometrySchema),
    createSpirometryTest
);
router.get('/:id', getSpirometryTestById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updatePulmonologySpirometrySchema),
    updateSpirometryTest
);
router.delete('/:id', authorize('ADMIN'), deleteSpirometryTest);

export default router;
