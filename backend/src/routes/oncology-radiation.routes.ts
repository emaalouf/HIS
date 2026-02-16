import { Router } from 'express';
import {
    createOncologyRadiation,
    deleteOncologyRadiation,
    getOncologyRadiationById,
    getOncologyRadiations,
    updateOncologyRadiation,
} from '../controllers/oncology-radiation.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createOncologyRadiationSchema, updateOncologyRadiationSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getOncologyRadiations);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createOncologyRadiationSchema),
    createOncologyRadiation
);
router.get('/:id', getOncologyRadiationById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateOncologyRadiationSchema),
    updateOncologyRadiation
);
router.delete('/:id', authorize('ADMIN'), deleteOncologyRadiation);

export default router;
