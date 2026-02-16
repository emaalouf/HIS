import { Router } from 'express';
import {
    createDermBiopsy,
    deleteDermBiopsy,
    getDermBiopsyById,
    getDermBiopsies,
    updateDermBiopsy,
} from '../controllers/dermatology-biopsy.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createDermBiopsySchema, updateDermBiopsySchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getDermBiopsies);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createDermBiopsySchema),
    createDermBiopsy
);
router.get('/:id', getDermBiopsyById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateDermBiopsySchema),
    updateDermBiopsy
);
router.delete('/:id', authorize('ADMIN'), deleteDermBiopsy);

export default router;
