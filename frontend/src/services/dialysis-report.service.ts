import api from './api';
import type { ApiResponse, DialysisReportSummary } from '../types';

export interface GetDialysisReportParams {
    startDate?: string;
    endDate?: string;
}

export const dialysisReportService = {
    async getSummary(params: GetDialysisReportParams = {}): Promise<DialysisReportSummary> {
        const response = await api.get<ApiResponse<DialysisReportSummary>>('/dialysis-reports/summary', { params });
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get dialysis report summary');
    },
};

export default dialysisReportService;
