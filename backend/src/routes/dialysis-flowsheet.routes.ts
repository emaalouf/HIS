import { Router } from 'express';
import {
    createDialysisFlowsheet,
    deleteDialysisFlowsheet,
    getDialysisFlowsheetById,
    getDialysisFlowsheets,
    updateDialysisFlowsheet,
} from '../controllers/dialysis-flowsheet.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createDialysisFlowsheetSchema, updateDialysisFlowsheetSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getDialysisFlowsheets);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createDialysisFlowsheetSchema),
    createDialysisFlowsheet
);
router.get('/:id', getDialysisFlowsheetById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateDialysisFlowsheetSchema),
    updateDialysisFlowsheet
);
router.delete('/:id', authorize('ADMIN'), deleteDialysisFlowsheet);

export default router;
