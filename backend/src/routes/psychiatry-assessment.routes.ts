import { Router } from 'express';
import {
    createPsychiatryAssessment,
    deletePsychiatryAssessment,
    getPsychiatryAssessmentById,
    getPsychiatryAssessments,
    updatePsychiatryAssessment,
} from '../controllers/psychiatry-assessment.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createPsychiatryAssessmentSchema, updatePsychiatryAssessmentSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getPsychiatryAssessments);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createPsychiatryAssessmentSchema),
    createPsychiatryAssessment
);
router.get('/:id', getPsychiatryAssessmentById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updatePsychiatryAssessmentSchema),
    updatePsychiatryAssessment
);
router.delete('/:id', authorize('ADMIN'), deletePsychiatryAssessment);

export default router;
