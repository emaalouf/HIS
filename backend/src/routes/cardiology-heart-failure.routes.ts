import { Router } from 'express';
import {
    createCardiologyHeartFailure,
    deleteCardiologyHeartFailure,
    getCardiologyHeartFailureAssessments,
    getCardiologyHeartFailureById,
    updateCardiologyHeartFailure,
} from '../controllers/cardiology-heart-failure.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createCardiologyHeartFailureSchema, updateCardiologyHeartFailureSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getCardiologyHeartFailureAssessments);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createCardiologyHeartFailureSchema),
    createCardiologyHeartFailure
);
router.get('/:id', getCardiologyHeartFailureById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateCardiologyHeartFailureSchema),
    updateCardiologyHeartFailure
);
router.delete('/:id', authorize('ADMIN'), deleteCardiologyHeartFailure);

export default router;
