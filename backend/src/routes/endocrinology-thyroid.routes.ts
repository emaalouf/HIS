import { Router } from 'express';
import {
    createThyroidTest,
    deleteThyroidTest,
    getThyroidTestById,
    getThyroidTests,
    updateThyroidTest,
} from '../controllers/endocrinology-thyroid.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createEndocrinologyThyroidSchema, updateEndocrinologyThyroidSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getThyroidTests);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createEndocrinologyThyroidSchema),
    createThyroidTest
);
router.get('/:id', getThyroidTestById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateEndocrinologyThyroidSchema),
    updateThyroidTest
);
router.delete('/:id', authorize('ADMIN'), deleteThyroidTest);

export default router;
