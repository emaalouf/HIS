import { Router } from 'express';
import {
    createDialysisLab,
    deleteDialysisLab,
    getDialysisLabById,
    getDialysisLabs,
    updateDialysisLab,
} from '../controllers/dialysis-lab.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createDialysisLabSchema, updateDialysisLabSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getDialysisLabs);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createDialysisLabSchema),
    createDialysisLab
);
router.get('/:id', getDialysisLabById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateDialysisLabSchema),
    updateDialysisLab
);
router.delete('/:id', authorize('ADMIN'), deleteDialysisLab);

export default router;
