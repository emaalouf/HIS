import { Router } from 'express';
import {
    createPedsDevelopmentalAssessment,
    deletePedsDevelopmentalAssessment,
    getPedsDevelopmentalAssessmentById,
    getPedsDevelopmentalAssessments,
    updatePedsDevelopmentalAssessment,
} from '../controllers/pediatrics-developmental.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createPedsDevelopmentalSchema, updatePedsDevelopmentalSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getPedsDevelopmentalAssessments);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createPedsDevelopmentalSchema),
    createPedsDevelopmentalAssessment
);
router.get('/:id', getPedsDevelopmentalAssessmentById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updatePedsDevelopmentalSchema),
    updatePedsDevelopmentalAssessment
);
router.delete('/:id', authorize('ADMIN'), deletePedsDevelopmentalAssessment);

export default router;
