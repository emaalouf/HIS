import { Router } from 'express';
import {
    createOncologyStaging,
    deleteOncologyStaging,
    getOncologyStagingById,
    getOncologyStagings,
    updateOncologyStaging,
} from '../controllers/oncology-staging.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createOncologyStagingSchema, updateOncologyStagingSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getOncologyStagings);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createOncologyStagingSchema),
    createOncologyStaging
);
router.get('/:id', getOncologyStagingById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateOncologyStagingSchema),
    updateOncologyStaging
);
router.delete('/:id', authorize('ADMIN'), deleteOncologyStaging);

export default router;
