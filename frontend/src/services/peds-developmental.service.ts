import api from './api';
import type { ApiResponse, PedsDevelopmental, CreatePedsDevelopmentalRequest } from '../types';

export interface PedsDevelopmentalsResponse {
    developmentals: PedsDevelopmental[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetPedsDevelopmentalsParams {
    page?: number;
    limit?: number;
    search?: string;
    patientId?: string;
    providerId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const pedsDevelopmentalService = {
    async getDevelopmentals(params: GetPedsDevelopmentalsParams = {}): Promise<PedsDevelopmentalsResponse> {
        const response = await api.get<ApiResponse<PedsDevelopmental[]>>('/peds-developmental', { params });
        if (response.data.success && response.data.data) {
            return {
                developmentals: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get developmental assessments');
    },

    async getDevelopmental(id: string): Promise<PedsDevelopmental> {
        const response = await api.get<ApiResponse<PedsDevelopmental>>(`/peds-developmental/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get developmental assessment');
    },

    async createDevelopmental(data: CreatePedsDevelopmentalRequest): Promise<PedsDevelopmental> {
        const response = await api.post<ApiResponse<PedsDevelopmental>>('/peds-developmental', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create developmental assessment');
    },

    async updateDevelopmental(id: string, data: Partial<CreatePedsDevelopmentalRequest>): Promise<PedsDevelopmental> {
        const response = await api.put<ApiResponse<PedsDevelopmental>>(`/peds-developmental/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update developmental assessment');
    },

    async deleteDevelopmental(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/peds-developmental/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete developmental assessment');
        }
    },
};

export default pedsDevelopmentalService;
