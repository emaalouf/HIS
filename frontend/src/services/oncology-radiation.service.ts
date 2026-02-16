import api from './api';
import type { ApiResponse, OncologyRadiation, CreateOncologyRadiationRequest } from '../types';

export interface OncologyRadiationsResponse {
    radiations: OncologyRadiation[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetOncologyRadiationsParams {
    page?: number;
    limit?: number;
    search?: string;
    patientId?: string;
    providerId?: string;
    status?: string;
    cancerType?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const oncologyRadiationService = {
    async getRadiations(params: GetOncologyRadiationsParams = {}): Promise<OncologyRadiationsResponse> {
        const response = await api.get<ApiResponse<OncologyRadiation[]>>('/oncology-radiation', { params });
        if (response.data.success && response.data.data) {
            return {
                radiations: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get radiation records');
    },

    async getRadiation(id: string): Promise<OncologyRadiation> {
        const response = await api.get<ApiResponse<OncologyRadiation>>(`/oncology-radiation/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get radiation record');
    },

    async createRadiation(data: CreateOncologyRadiationRequest): Promise<OncologyRadiation> {
        const response = await api.post<ApiResponse<OncologyRadiation>>('/oncology-radiation', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create radiation record');
    },

    async updateRadiation(id: string, data: Partial<CreateOncologyRadiationRequest>): Promise<OncologyRadiation> {
        const response = await api.put<ApiResponse<OncologyRadiation>>(`/oncology-radiation/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update radiation record');
    },

    async deleteRadiation(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/oncology-radiation/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete radiation record');
        }
    },
};

export default oncologyRadiationService;
