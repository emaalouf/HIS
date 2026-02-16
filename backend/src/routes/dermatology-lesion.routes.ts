import { Router } from 'express';
import {
    createDermLesion,
    deleteDermLesion,
    getDermLesionById,
    getDermLesions,
    updateDermLesion,
} from '../controllers/dermatology-lesion.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createDermLesionSchema, updateDermLesionSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getDermLesions);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createDermLesionSchema),
    createDermLesion
);
router.get('/:id', getDermLesionById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateDermLesionSchema),
    updateDermLesion
);
router.delete('/:id', authorize('ADMIN'), deleteDermLesion);

export default router;
