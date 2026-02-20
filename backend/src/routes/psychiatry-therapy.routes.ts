import { Router } from 'express';
import {
    createPsychiatryTherapySession,
    deletePsychiatryTherapySession,
    getPsychiatryTherapySessionById,
    getPsychiatryTherapySessions,
    updatePsychiatryTherapySession,
} from '../controllers/psychiatry-therapy.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createPsychiatryTherapySchema, updatePsychiatryTherapySchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getPsychiatryTherapySessions);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createPsychiatryTherapySchema),
    createPsychiatryTherapySession
);
router.get('/:id', getPsychiatryTherapySessionById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updatePsychiatryTherapySchema),
    updatePsychiatryTherapySession
);
router.delete('/:id', authorize('ADMIN'), deletePsychiatryTherapySession);

export default router;
