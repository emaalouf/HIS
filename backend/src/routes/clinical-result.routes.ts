import { Router } from 'express';
import {
    createClinicalResult,
    deleteClinicalResult,
    getClinicalResultById,
    getClinicalResults,
    updateClinicalResult,
} from '../controllers/clinical-result.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createClinicalResultSchema, updateClinicalResultSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getClinicalResults);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createClinicalResultSchema),
    createClinicalResult
);
router.get('/:id', getClinicalResultById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateClinicalResultSchema),
    updateClinicalResult
);
router.delete('/:id', authorize('ADMIN'), deleteClinicalResult);

export default router;
