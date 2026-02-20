import { Router } from 'express';
import {
    createCardiologyEcho,
    deleteCardiologyEcho,
    getCardiologyEchoById,
    getCardiologyEchos,
    updateCardiologyEcho,
} from '../controllers/cardiology-echo.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createCardiologyEchoSchema, updateCardiologyEchoSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getCardiologyEchos);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createCardiologyEchoSchema),
    createCardiologyEcho
);
router.get('/:id', getCardiologyEchoById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateCardiologyEchoSchema),
    updateCardiologyEcho
);
router.delete('/:id', authorize('ADMIN'), deleteCardiologyEcho);

export default router;
