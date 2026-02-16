import { Router } from 'express';
import {
    createEntAudiometryTest,
    deleteEntAudiometryTest,
    getEntAudiometryTestById,
    getEntAudiometryTests,
    updateEntAudiometryTest,
} from '../controllers/ent-audiometry.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createEntAudiometrySchema, updateEntAudiometrySchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getEntAudiometryTests);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createEntAudiometrySchema),
    createEntAudiometryTest
);
router.get('/:id', getEntAudiometryTestById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateEntAudiometrySchema),
    updateEntAudiometryTest
);
router.delete('/:id', authorize('ADMIN'), deleteEntAudiometryTest);

export default router;
