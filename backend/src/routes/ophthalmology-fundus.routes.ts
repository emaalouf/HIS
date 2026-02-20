import { Router } from 'express';
import {
    createOphthFundusExam,
    deleteOphthFundusExam,
    getOphthFundusExamById,
    getOphthFundusExams,
    updateOphthFundusExam,
} from '../controllers/ophthalmology-fundus.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createOphthFundusSchema, updateOphthFundusSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getOphthFundusExams);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createOphthFundusSchema),
    createOphthFundusExam
);
router.get('/:id', getOphthFundusExamById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateOphthFundusSchema),
    updateOphthFundusExam
);
router.delete('/:id', authorize('ADMIN'), deleteOphthFundusExam);

export default router;
