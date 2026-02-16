import { Router } from 'express';
import {
    createOrthopedicJointReplacement,
    deleteOrthopedicJointReplacement,
    getOrthopedicJointReplacementById,
    getOrthopedicJointReplacements,
    updateOrthopedicJointReplacement,
} from '../controllers/orthopedic-joint-replacement.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createOrthopedicJointReplacementSchema, updateOrthopedicJointReplacementSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getOrthopedicJointReplacements);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createOrthopedicJointReplacementSchema),
    createOrthopedicJointReplacement
);
router.get('/:id', getOrthopedicJointReplacementById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateOrthopedicJointReplacementSchema),
    updateOrthopedicJointReplacement
);
router.delete('/:id', authorize('ADMIN'), deleteOrthopedicJointReplacement);

export default router;
