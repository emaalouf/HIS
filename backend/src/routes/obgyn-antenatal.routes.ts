import { Router } from 'express';
import {
    createObgynAntenatalVisit,
    deleteObgynAntenatalVisit,
    getObgynAntenatalVisitById,
    getObgynAntenatalVisits,
    updateObgynAntenatalVisit,
} from '../controllers/obgyn-antenatal.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createObgynAntenatalSchema, updateObgynAntenatalSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getObgynAntenatalVisits);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createObgynAntenatalSchema),
    createObgynAntenatalVisit
);
router.get('/:id', getObgynAntenatalVisitById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateObgynAntenatalSchema),
    updateObgynAntenatalVisit
);
router.delete('/:id', authorize('ADMIN'), deleteObgynAntenatalVisit);

export default router;
