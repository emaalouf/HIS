import { Router } from 'express';
import {
    createSleepStudy,
    deleteSleepStudy,
    getSleepStudyById,
    getSleepStudies,
    updateSleepStudy,
} from '../controllers/pulmonology-sleep-study.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createPulmonologySleepStudySchema, updatePulmonologySleepStudySchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getSleepStudies);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createPulmonologySleepStudySchema),
    createSleepStudy
);
router.get('/:id', getSleepStudyById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updatePulmonologySleepStudySchema),
    updateSleepStudy
);
router.delete('/:id', authorize('ADMIN'), deleteSleepStudy);

export default router;
