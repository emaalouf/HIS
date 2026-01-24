import api from './api';
import type { ApiResponse, CardiologyReportSummary } from '../types';

export interface GetCardiologyReportParams {
    startDate?: string;
    endDate?: string;
}

export const cardiologyReportService = {
    async getSummary(params: GetCardiologyReportParams = {}): Promise<CardiologyReportSummary> {
        const response = await api.get<ApiResponse<CardiologyReportSummary>>('/cardiology-reports/summary', { params });
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get cardiology report summary');
    },
};

export default cardiologyReportService;
