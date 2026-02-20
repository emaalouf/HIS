import { Router } from 'express';
import {
    createDialysisSession,
    deleteDialysisSession,
    getDialysisSessionById,
    getDialysisSessions,
    updateDialysisSession,
} from '../controllers/dialysis-session.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createDialysisSessionSchema, updateDialysisSessionSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getDialysisSessions);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createDialysisSessionSchema),
    createDialysisSession
);
router.get('/:id', getDialysisSessionById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateDialysisSessionSchema),
    updateDialysisSession
);
router.delete('/:id', authorize('ADMIN'), deleteDialysisSession);

export default router;
