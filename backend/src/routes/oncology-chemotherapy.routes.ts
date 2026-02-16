import { Router } from 'express';
import {
    createOncologyChemotherapy,
    deleteOncologyChemotherapy,
    getOncologyChemotherapyById,
    getOncologyChemotherapies,
    updateOncologyChemotherapy,
} from '../controllers/oncology-chemotherapy.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createOncologyChemotherapySchema, updateOncologyChemotherapySchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getOncologyChemotherapies);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createOncologyChemotherapySchema),
    createOncologyChemotherapy
);
router.get('/:id', getOncologyChemotherapyById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateOncologyChemotherapySchema),
    updateOncologyChemotherapy
);
router.delete('/:id', authorize('ADMIN'), deleteOncologyChemotherapy);

export default router;
