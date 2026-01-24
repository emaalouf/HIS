import { Router } from 'express';
import {
    createCardiologyStressTest,
    deleteCardiologyStressTest,
    getCardiologyStressTestById,
    getCardiologyStressTests,
    updateCardiologyStressTest,
} from '../controllers/cardiology-stress-test.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createCardiologyStressTestSchema, updateCardiologyStressTestSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getCardiologyStressTests);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createCardiologyStressTestSchema),
    createCardiologyStressTest
);
router.get('/:id', getCardiologyStressTestById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateCardiologyStressTestSchema),
    updateCardiologyStressTest
);
router.delete('/:id', authorize('ADMIN'), deleteCardiologyStressTest);

export default router;
