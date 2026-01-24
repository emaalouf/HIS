import api from './api';
import type {
    ApiResponse,
    CreateNephrologyLabResultRequest,
    NephrologyLabResult,
} from '../types';

export interface NephrologyLabResultsResponse {
    results: NephrologyLabResult[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetNephrologyLabResultsParams {
    page?: number;
    limit?: number;
    search?: string;
    patientId?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const nephrologyLabService = {
    async getResults(params: GetNephrologyLabResultsParams = {}): Promise<NephrologyLabResultsResponse> {
        const response = await api.get<ApiResponse<NephrologyLabResult[]>>('/nephrology-labs', { params });
        if (response.data.success && response.data.data) {
            return {
                results: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get nephrology lab results');
    },

    async getResult(id: string): Promise<NephrologyLabResult> {
        const response = await api.get<ApiResponse<NephrologyLabResult>>(`/nephrology-labs/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get nephrology lab result');
    },

    async createResult(data: CreateNephrologyLabResultRequest): Promise<NephrologyLabResult> {
        const response = await api.post<ApiResponse<NephrologyLabResult>>('/nephrology-labs', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create nephrology lab result');
    },

    async updateResult(id: string, data: Partial<CreateNephrologyLabResultRequest>): Promise<NephrologyLabResult> {
        const response = await api.put<ApiResponse<NephrologyLabResult>>(`/nephrology-labs/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update nephrology lab result');
    },

    async deleteResult(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/nephrology-labs/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete nephrology lab result');
        }
    },
};

export default nephrologyLabService;
