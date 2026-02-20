import { Router } from 'express';
import {
    createOperatingTheater,
    deleteOperatingTheater,
    getOperatingTheaterById,
    getOperatingTheaters,
    updateOperatingTheater,
} from '../controllers/operating-theater.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createOperatingTheaterSchema, updateOperatingTheaterSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getOperatingTheaters);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createOperatingTheaterSchema),
    createOperatingTheater
);
router.get('/:id', getOperatingTheaterById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateOperatingTheaterSchema),
    updateOperatingTheater
);
router.delete('/:id', authorize('ADMIN'), deleteOperatingTheater);

export default router;