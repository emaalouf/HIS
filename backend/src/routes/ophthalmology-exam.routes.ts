import { Router } from 'express';
import {
    createOphthExam,
    deleteOphthExam,
    getOphthExamById,
    getOphthExams,
    updateOphthExam,
} from '../controllers/ophthalmology-exam.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createOphthExamSchema, updateOphthExamSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getOphthExams);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createOphthExamSchema),
    createOphthExam
);
router.get('/:id', getOphthExamById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateOphthExamSchema),
    updateOphthExam
);
router.delete('/:id', authorize('ADMIN'), deleteOphthExam);

export default router;
