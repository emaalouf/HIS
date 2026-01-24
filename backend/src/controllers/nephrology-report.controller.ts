import { Request, Response } from 'express';
import { nephrologyReportService } from '../services/nephrology-report.service';
import { sendError, sendSuccess } from '../utils/helpers';

export const getNephrologyReportSummary = async (req: Request, res: Response): Promise<void> => {
    try {
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;

        const summary = await nephrologyReportService.getSummary({ startDate, endDate });
        sendSuccess(res, summary);
    } catch (error) {
        console.error('Get nephrology report summary error:', error);
        sendError(res, 'Failed to fetch nephrology report summary', 500);
    }
};
