import { Router } from 'express';
import {
    createNeurologyImaging,
    deleteNeurologyImaging,
    getNeurologyImagingById,
    getNeurologyImagings,
    updateNeurologyImaging,
} from '../controllers/neurology-imaging.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createNeurologyImagingSchema, updateNeurologyImagingSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getNeurologyImagings);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createNeurologyImagingSchema),
    createNeurologyImaging
);
router.get('/:id', getNeurologyImagingById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateNeurologyImagingSchema),
    updateNeurologyImaging
);
router.delete('/:id', authorize('ADMIN'), deleteNeurologyImaging);

export default router;
