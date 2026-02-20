import { Router } from 'express';
import {
    createCardiologyLab,
    deleteCardiologyLab,
    getCardiologyLabById,
    getCardiologyLabs,
    updateCardiologyLab,
} from '../controllers/cardiology-lab.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createCardiologyLabSchema, updateCardiologyLabSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getCardiologyLabs);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createCardiologyLabSchema),
    createCardiologyLab
);
router.get('/:id', getCardiologyLabById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateCardiologyLabSchema),
    updateCardiologyLab
);
router.delete('/:id', authorize('ADMIN'), deleteCardiologyLab);

export default router;
