import { Router } from 'express';
import {
    createCardiologyVisit,
    deleteCardiologyVisit,
    getCardiologyVisitById,
    getCardiologyVisits,
    updateCardiologyVisit,
} from '../controllers/cardiology-visit.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createCardiologyVisitSchema, updateCardiologyVisitSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getCardiologyVisits);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createCardiologyVisitSchema),
    createCardiologyVisit
);
router.get('/:id', getCardiologyVisitById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateCardiologyVisitSchema),
    updateCardiologyVisit
);
router.delete('/:id', authorize('ADMIN'), deleteCardiologyVisit);

export default router;
