import { Router } from 'express';
import {
    createBronchoscopy,
    deleteBronchoscopy,
    getBronchoscopyById,
    getBronchoscopies,
    updateBronchoscopy,
} from '../controllers/pulmonology-bronchoscopy.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createPulmonologyBronchoscopySchema, updatePulmonologyBronchoscopySchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getBronchoscopies);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createPulmonologyBronchoscopySchema),
    createBronchoscopy
);
router.get('/:id', getBronchoscopyById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updatePulmonologyBronchoscopySchema),
    updateBronchoscopy
);
router.delete('/:id', authorize('ADMIN'), deleteBronchoscopy);

export default router;
