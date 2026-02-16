import { Router } from 'express';
import {
    createDiabetesRecord,
    deleteDiabetesRecord,
    getDiabetesRecordById,
    getDiabetesRecords,
    updateDiabetesRecord,
} from '../controllers/endocrinology-diabetes.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createEndocrinologyDiabetesSchema, updateEndocrinologyDiabetesSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getDiabetesRecords);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createEndocrinologyDiabetesSchema),
    createDiabetesRecord
);
router.get('/:id', getDiabetesRecordById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateEndocrinologyDiabetesSchema),
    updateDiabetesRecord
);
router.delete('/:id', authorize('ADMIN'), deleteDiabetesRecord);

export default router;
