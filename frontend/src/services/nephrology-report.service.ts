import api from './api';
import type { ApiResponse, NephrologyReportSummary } from '../types';

export interface GetNephrologyReportParams {
    startDate?: string;
    endDate?: string;
}

export const nephrologyReportService = {
    async getSummary(params: GetNephrologyReportParams = {}): Promise<NephrologyReportSummary> {
        const response = await api.get<ApiResponse<NephrologyReportSummary>>('/nephrology-reports/summary', { params });
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get nephrology report summary');
    },
};

export default nephrologyReportService;
