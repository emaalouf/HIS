import { Router } from 'express';
import {
    createNephrologyLab,
    deleteNephrologyLab,
    getNephrologyLabById,
    getNephrologyLabs,
    updateNephrologyLab,
} from '../controllers/nephrology-lab.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createNephrologyLabSchema, updateNephrologyLabSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getNephrologyLabs);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createNephrologyLabSchema),
    createNephrologyLab
);
router.get('/:id', getNephrologyLabById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateNephrologyLabSchema),
    updateNephrologyLab
);
router.delete('/:id', authorize('ADMIN'), deleteNephrologyLab);

export default router;
