import { Router } from 'express';
import {
    createDialysisStation,
    deleteDialysisStation,
    getDialysisStationById,
    getDialysisStations,
    updateDialysisStation,
} from '../controllers/dialysis-station.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createDialysisStationSchema, updateDialysisStationSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getDialysisStations);
router.post('/', authorize('ADMIN'), validate(createDialysisStationSchema), createDialysisStation);
router.get('/:id', getDialysisStationById);
router.put('/:id', authorize('ADMIN'), validate(updateDialysisStationSchema), updateDialysisStation);
router.delete('/:id', authorize('ADMIN'), deleteDialysisStation);

export default router;
