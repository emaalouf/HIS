import api from './api';
import type {
    ApiResponse,
    DialysisLabResult,
    CreateDialysisLabResultRequest,
} from '../types';

export interface DialysisLabResultsResponse {
    results: DialysisLabResult[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetDialysisLabResultsParams {
    page?: number;
    limit?: number;
    search?: string;
    patientId?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const dialysisLabService = {
    async getResults(params: GetDialysisLabResultsParams = {}): Promise<DialysisLabResultsResponse> {
        const response = await api.get<ApiResponse<DialysisLabResult[]>>('/dialysis-labs', { params });
        if (response.data.success && response.data.data) {
            return {
                results: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get dialysis lab results');
    },

    async getResult(id: string): Promise<DialysisLabResult> {
        const response = await api.get<ApiResponse<DialysisLabResult>>(`/dialysis-labs/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get dialysis lab result');
    },

    async createResult(data: CreateDialysisLabResultRequest): Promise<DialysisLabResult> {
        const response = await api.post<ApiResponse<DialysisLabResult>>('/dialysis-labs', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create dialysis lab result');
    },

    async updateResult(id: string, data: Partial<CreateDialysisLabResultRequest>): Promise<DialysisLabResult> {
        const response = await api.put<ApiResponse<DialysisLabResult>>(`/dialysis-labs/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update dialysis lab result');
    },

    async deleteResult(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/dialysis-labs/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete dialysis lab result');
        }
    },
};

export default dialysisLabService;
