import { Router } from 'express';
import {
    createNephrologyBiopsy,
    deleteNephrologyBiopsy,
    getNephrologyBiopsies,
    getNephrologyBiopsyById,
    updateNephrologyBiopsy,
} from '../controllers/nephrology-biopsy.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createNephrologyBiopsySchema, updateNephrologyBiopsySchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getNephrologyBiopsies);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createNephrologyBiopsySchema),
    createNephrologyBiopsy
);
router.get('/:id', getNephrologyBiopsyById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateNephrologyBiopsySchema),
    updateNephrologyBiopsy
);
router.delete('/:id', authorize('ADMIN'), deleteNephrologyBiopsy);

export default router;
