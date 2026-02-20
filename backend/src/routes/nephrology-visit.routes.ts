import { Router } from 'express';
import {
    createNephrologyVisit,
    deleteNephrologyVisit,
    getNephrologyVisitById,
    getNephrologyVisits,
    updateNephrologyVisit,
} from '../controllers/nephrology-visit.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createNephrologyVisitSchema, updateNephrologyVisitSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getNephrologyVisits);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createNephrologyVisitSchema),
    createNephrologyVisit
);
router.get('/:id', getNephrologyVisitById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateNephrologyVisitSchema),
    updateNephrologyVisit
);
router.delete('/:id', authorize('ADMIN'), deleteNephrologyVisit);

export default router;
