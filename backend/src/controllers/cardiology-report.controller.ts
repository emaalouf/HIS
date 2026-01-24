import { Request, Response } from 'express';
import { cardiologyReportService } from '../services/cardiology-report.service';
import { sendError, sendSuccess } from '../utils/helpers';

export const getCardiologyReportSummary = async (req: Request, res: Response): Promise<void> => {
    try {
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;

        const summary = await cardiologyReportService.getSummary({ startDate, endDate });
        sendSuccess(res, summary);
    } catch (error) {
        console.error('Get cardiology report summary error:', error);
        sendError(res, 'Failed to fetch cardiology report summary', 500);
    }
};
