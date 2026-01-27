import { Router } from 'express';
import {
    createGastroEndoscopy,
    deleteGastroEndoscopy,
    getGastroEndoscopyById,
    getGastroEndoscopies,
    updateGastroEndoscopy,
} from '../controllers/gastro-endoscopy.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createGastroEndoscopySchema, updateGastroEndoscopySchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getGastroEndoscopies);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createGastroEndoscopySchema),
    createGastroEndoscopy
);
router.get('/:id', getGastroEndoscopyById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateGastroEndoscopySchema),
    updateGastroEndoscopy
);
router.delete('/:id', authorize('ADMIN'), deleteGastroEndoscopy);

export default router;
