import api from './api';
import type {
    ApiResponse,
    CardiologyLabResult,
    CreateCardiologyLabResultRequest,
} from '../types';

export interface CardiologyLabResultsResponse {
    results: CardiologyLabResult[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetCardiologyLabResultsParams {
    page?: number;
    limit?: number;
    search?: string;
    patientId?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const cardiologyLabService = {
    async getResults(params: GetCardiologyLabResultsParams = {}): Promise<CardiologyLabResultsResponse> {
        const response = await api.get<ApiResponse<CardiologyLabResult[]>>('/cardiology-labs', { params });
        if (response.data.success && response.data.data) {
            return {
                results: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get cardiology lab results');
    },

    async getResult(id: string): Promise<CardiologyLabResult> {
        const response = await api.get<ApiResponse<CardiologyLabResult>>(`/cardiology-labs/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get cardiology lab result');
    },

    async createResult(data: CreateCardiologyLabResultRequest): Promise<CardiologyLabResult> {
        const response = await api.post<ApiResponse<CardiologyLabResult>>('/cardiology-labs', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create cardiology lab result');
    },

    async updateResult(id: string, data: Partial<CreateCardiologyLabResultRequest>): Promise<CardiologyLabResult> {
        const response = await api.put<ApiResponse<CardiologyLabResult>>(`/cardiology-labs/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update cardiology lab result');
    },

    async deleteResult(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/cardiology-labs/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete cardiology lab result');
        }
    },
};

export default cardiologyLabService;
