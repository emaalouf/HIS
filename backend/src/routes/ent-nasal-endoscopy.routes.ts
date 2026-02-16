import { Router } from 'express';
import {
    createEntNasalEndoscopy,
    deleteEntNasalEndoscopy,
    getEntNasalEndoscopyById,
    getEntNasalEndoscopies,
    updateEntNasalEndoscopy,
} from '../controllers/ent-nasal-endoscopy.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createEntNasalEndoscopySchema, updateEntNasalEndoscopySchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getEntNasalEndoscopies);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createEntNasalEndoscopySchema),
    createEntNasalEndoscopy
);
router.get('/:id', getEntNasalEndoscopyById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateEntNasalEndoscopySchema),
    updateEntNasalEndoscopy
);
router.delete('/:id', authorize('ADMIN'), deleteEntNasalEndoscopy);

export default router;
