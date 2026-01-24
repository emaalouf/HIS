import { Router } from 'express';
import { getCardiologyReportSummary } from '../controllers/cardiology-report.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/summary', getCardiologyReportSummary);

export default router;
