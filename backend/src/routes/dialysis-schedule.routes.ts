import { Router } from 'express';
import {
    createDialysisSchedule,
    deleteDialysisSchedule,
    getDialysisScheduleById,
    getDialysisSchedules,
    updateDialysisSchedule,
} from '../controllers/dialysis-schedule.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createDialysisScheduleSchema, updateDialysisScheduleSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getDialysisSchedules);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createDialysisScheduleSchema),
    createDialysisSchedule
);
router.get('/:id', getDialysisScheduleById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateDialysisScheduleSchema),
    updateDialysisSchedule
);
router.delete('/:id', authorize('ADMIN'), deleteDialysisSchedule);

export default router;
