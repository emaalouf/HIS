import { Router } from 'express';
import {
    createCardiologyEcg,
    deleteCardiologyEcg,
    getCardiologyEcgById,
    getCardiologyEcgs,
    updateCardiologyEcg,
} from '../controllers/cardiology-ecg.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createCardiologyEcgSchema, updateCardiologyEcgSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getCardiologyEcgs);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createCardiologyEcgSchema),
    createCardiologyEcg
);
router.get('/:id', getCardiologyEcgById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateCardiologyEcgSchema),
    updateCardiologyEcg
);
router.delete('/:id', authorize('ADMIN'), deleteCardiologyEcg);

export default router;
