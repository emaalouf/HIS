import { Router } from 'express';
import {
    addTeamMember,
    createSurgery,
    deleteSurgery,
    getSurgeryById,
    getSurgeries,
    removeTeamMember,
    updateSurgery,
    updateSurgeryStatus,
} from '../controllers/surgery.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createSurgerySchema, updateSurgerySchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getSurgeries);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createSurgerySchema),
    createSurgery
);
router.get('/:id', getSurgeryById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateSurgerySchema),
    updateSurgery
);
router.patch(
    '/:id/status',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    updateSurgeryStatus
);
router.post(
    '/:id/team',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    addTeamMember
);
router.delete(
    '/:id/team',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    removeTeamMember
);
router.delete('/:id', authorize('ADMIN'), deleteSurgery);

export default router;