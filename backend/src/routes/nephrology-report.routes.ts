import { Router } from 'express';
import { getNephrologyReportSummary } from '../controllers/nephrology-report.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/summary', getNephrologyReportSummary);

export default router;
