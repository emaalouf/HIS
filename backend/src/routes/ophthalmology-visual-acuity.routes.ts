import { Router } from 'express';
import {
    createOphthVisualAcuityTest,
    deleteOphthVisualAcuityTest,
    getOphthVisualAcuityTestById,
    getOphthVisualAcuityTests,
    updateOphthVisualAcuityTest,
} from '../controllers/ophthalmology-visual-acuity.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createOphthVisualAcuitySchema, updateOphthVisualAcuitySchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getOphthVisualAcuityTests);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createOphthVisualAcuitySchema),
    createOphthVisualAcuityTest
);
router.get('/:id', getOphthVisualAcuityTestById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateOphthVisualAcuitySchema),
    updateOphthVisualAcuityTest
);
router.delete('/:id', authorize('ADMIN'), deleteOphthVisualAcuityTest);

export default router;
