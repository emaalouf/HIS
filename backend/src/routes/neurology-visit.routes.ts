import { Router } from 'express';
import {
    createNeurologyVisit,
    deleteNeurologyVisit,
    getNeurologyVisitById,
    getNeurologyVisits,
    updateNeurologyVisit,
} from '../controllers/neurology-visit.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createNeurologyVisitSchema, updateNeurologyVisitSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getNeurologyVisits);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createNeurologyVisitSchema),
    createNeurologyVisit
);
router.get('/:id', getNeurologyVisitById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateNeurologyVisitSchema),
    updateNeurologyVisit
);
router.delete('/:id', authorize('ADMIN'), deleteNeurologyVisit);

export default router;
