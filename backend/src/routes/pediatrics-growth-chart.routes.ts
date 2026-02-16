import { Router } from 'express';
import {
    createPedsGrowthChart,
    deletePedsGrowthChart,
    getPedsGrowthChartById,
    getPedsGrowthCharts,
    updatePedsGrowthChart,
} from '../controllers/pediatrics-growth-chart.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createPedsGrowthChartSchema, updatePedsGrowthChartSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getPedsGrowthCharts);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createPedsGrowthChartSchema),
    createPedsGrowthChart
);
router.get('/:id', getPedsGrowthChartById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updatePedsGrowthChartSchema),
    updatePedsGrowthChart
);
router.delete('/:id', authorize('ADMIN'), deletePedsGrowthChart);

export default router;
