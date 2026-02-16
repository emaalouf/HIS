import api from './api';
import type { ApiResponse, OncologyStaging, CreateOncologyStagingRequest } from '../types';

export interface OncologyStagingsResponse {
    stagings: OncologyStaging[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetOncologyStagingsParams {
    page?: number;
    limit?: number;
    search?: string;
    patientId?: string;
    providerId?: string;
    cancerType?: string;
    overallStage?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const oncologyStagingService = {
    async getStagings(params: GetOncologyStagingsParams = {}): Promise<OncologyStagingsResponse> {
        const response = await api.get<ApiResponse<OncologyStaging[]>>('/oncology-staging', { params });
        if (response.data.success && response.data.data) {
            return {
                stagings: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get staging records');
    },

    async getStaging(id: string): Promise<OncologyStaging> {
        const response = await api.get<ApiResponse<OncologyStaging>>(`/oncology-staging/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get staging record');
    },

    async createStaging(data: CreateOncologyStagingRequest): Promise<OncologyStaging> {
        const response = await api.post<ApiResponse<OncologyStaging>>('/oncology-staging', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create staging record');
    },

    async updateStaging(id: string, data: Partial<CreateOncologyStagingRequest>): Promise<OncologyStaging> {
        const response = await api.put<ApiResponse<OncologyStaging>>(`/oncology-staging/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update staging record');
    },

    async deleteStaging(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/oncology-staging/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete staging record');
        }
    },
};

export default oncologyStagingService;
