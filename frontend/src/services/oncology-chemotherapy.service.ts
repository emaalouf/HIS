import api from './api';
import type { ApiResponse, OncologyChemotherapy, CreateOncologyChemotherapyRequest } from '../types';

export interface OncologyChemotherapiesResponse {
    chemotherapies: OncologyChemotherapy[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetOncologyChemotherapiesParams {
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

export const oncologyChemotherapyService = {
    async getChemotherapies(params: GetOncologyChemotherapiesParams = {}): Promise<OncologyChemotherapiesResponse> {
        const response = await api.get<ApiResponse<OncologyChemotherapy[]>>('/oncology-chemotherapy', { params });
        if (response.data.success && response.data.data) {
            return {
                chemotherapies: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get chemotherapy records');
    },

    async getChemotherapy(id: string): Promise<OncologyChemotherapy> {
        const response = await api.get<ApiResponse<OncologyChemotherapy>>(`/oncology-chemotherapy/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get chemotherapy record');
    },

    async createChemotherapy(data: CreateOncologyChemotherapyRequest): Promise<OncologyChemotherapy> {
        const response = await api.post<ApiResponse<OncologyChemotherapy>>('/oncology-chemotherapy', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create chemotherapy record');
    },

    async updateChemotherapy(id: string, data: Partial<CreateOncologyChemotherapyRequest>): Promise<OncologyChemotherapy> {
        const response = await api.put<ApiResponse<OncologyChemotherapy>>(`/oncology-chemotherapy/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update chemotherapy record');
    },

    async deleteChemotherapy(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/oncology-chemotherapy/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete chemotherapy record');
        }
    },
};

export default oncologyChemotherapyService;
