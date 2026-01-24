import { Router } from 'express';
import {
    createNephrologyImaging,
    deleteNephrologyImaging,
    getNephrologyImaging,
    getNephrologyImagingById,
    updateNephrologyImaging,
} from '../controllers/nephrology-imaging.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createNephrologyImagingSchema, updateNephrologyImagingSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getNephrologyImaging);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createNephrologyImagingSchema),
    createNephrologyImaging
);
router.get('/:id', getNephrologyImagingById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateNephrologyImagingSchema),
    updateNephrologyImaging
);
router.delete('/:id', authorize('ADMIN'), deleteNephrologyImaging);

export default router;
