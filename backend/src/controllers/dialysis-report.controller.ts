import { Request, Response } from 'express';
import { dialysisReportService } from '../services/dialysis-report.service';
import { sendError, sendSuccess } from '../utils/helpers';

export const getDialysisReportSummary = async (req: Request, res: Response): Promise<void> => {
    try {
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;

        const summary = await dialysisReportService.getSummary({ startDate, endDate });
        sendSuccess(res, summary);
    } catch (error) {
        console.error('Get dialysis report summary error:', error);
        sendError(res, 'Failed to fetch dialysis report summary', 500);
    }
};
