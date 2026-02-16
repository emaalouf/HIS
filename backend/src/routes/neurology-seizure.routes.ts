import { Router } from 'express';
import {
    createNeurologySeizure,
    deleteNeurologySeizure,
    getNeurologySeizureById,
    getNeurologySeizures,
    updateNeurologySeizure,
} from '../controllers/neurology-seizure.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createNeurologySeizureSchema, updateNeurologySeizureSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getNeurologySeizures);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createNeurologySeizureSchema),
    createNeurologySeizure
);
router.get('/:id', getNeurologySeizureById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateNeurologySeizureSchema),
    updateNeurologySeizure
);
router.delete('/:id', authorize('ADMIN'), deleteNeurologySeizure);

export default router;
