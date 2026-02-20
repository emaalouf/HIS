import { Router } from 'express';
import {
    createOrthopedicPhysicalTherapy,
    deleteOrthopedicPhysicalTherapy,
    getOrthopedicPhysicalTherapyById,
    getOrthopedicPhysicalTherapies,
    updateOrthopedicPhysicalTherapy,
} from '../controllers/orthopedic-physical-therapy.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createOrthopedicPhysicalTherapySchema, updateOrthopedicPhysicalTherapySchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getOrthopedicPhysicalTherapies);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createOrthopedicPhysicalTherapySchema),
    createOrthopedicPhysicalTherapy
);
router.get('/:id', getOrthopedicPhysicalTherapyById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateOrthopedicPhysicalTherapySchema),
    updateOrthopedicPhysicalTherapy
);
router.delete('/:id', authorize('ADMIN'), deleteOrthopedicPhysicalTherapy);

export default router;
