import api from './api';
import type {
    ApiResponse,
    ClinicalResult,
    CreateClinicalResultRequest,
    ResultFlag,
    ResultStatus,
} from '../types';

export interface ClinicalResultResponse {
    results: ClinicalResult[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetClinicalResultsParams {
    page?: number;
    limit?: number;
    status?: ResultStatus;
    flag?: ResultFlag;
    patientId?: string;
    orderId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const clinicalResultService = {
    async getResults(params: GetClinicalResultsParams = {}): Promise<ClinicalResultResponse> {
        const response = await api.get<ApiResponse<ClinicalResult[]>>('/clinical-results', { params });
        if (response.data.success && response.data.data) {
            return {
                results: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get results');
    },

    async getResult(id: string): Promise<ClinicalResult> {
        const response = await api.get<ApiResponse<ClinicalResult>>(`/clinical-results/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get result');
    },

    async createResult(data: CreateClinicalResultRequest): Promise<ClinicalResult> {
        const response = await api.post<ApiResponse<ClinicalResult>>('/clinical-results', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create result');
    },

    async updateResult(id: string, data: Partial<CreateClinicalResultRequest>): Promise<ClinicalResult> {
        const response = await api.put<ApiResponse<ClinicalResult>>(`/clinical-results/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update result');
    },

    async deleteResult(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/clinical-results/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete result');
        }
    },
};

export default clinicalResultService;
