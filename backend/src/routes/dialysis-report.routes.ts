import { Router } from 'express';
import { getDialysisReportSummary } from '../controllers/dialysis-report.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/summary', getDialysisReportSummary);

export default router;
