import { Router } from 'express';
import {
    createObgynPregnancy,
    deleteObgynPregnancy,
    getObgynPregnancyById,
    getObgynPregnancies,
    updateObgynPregnancy,
} from '../controllers/obgyn-pregnancy.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createObgynPregnancySchema, updateObgynPregnancySchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getObgynPregnancies);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createObgynPregnancySchema),
    createObgynPregnancy
);
router.get('/:id', getObgynPregnancyById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateObgynPregnancySchema),
    updateObgynPregnancy
);
router.delete('/:id', authorize('ADMIN'), deleteObgynPregnancy);

export default router;
