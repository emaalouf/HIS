import api from './api';
import type { ApiResponse, ObgynPregnancy, CreateObgynPregnancyRequest } from '../types';

export interface ObgynPregnanciesResponse {
    pregnancies: ObgynPregnancy[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetObgynPregnanciesParams {
    page?: number;
    limit?: number;
    search?: string;
    patientId?: string;
    providerId?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const obgynPregnancyService = {
    async getPregnancies(params: GetObgynPregnanciesParams = {}): Promise<ObgynPregnanciesResponse> {
        const response = await api.get<ApiResponse<ObgynPregnancy[]>>('/obgyn-pregnancies', { params });
        if (response.data.success && response.data.data) {
            return {
                pregnancies: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get pregnancy records');
    },

    async getPregnancy(id: string): Promise<ObgynPregnancy> {
        const response = await api.get<ApiResponse<ObgynPregnancy>>(`/obgyn-pregnancies/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get pregnancy record');
    },

    async createPregnancy(data: CreateObgynPregnancyRequest): Promise<ObgynPregnancy> {
        const response = await api.post<ApiResponse<ObgynPregnancy>>('/obgyn-pregnancies', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create pregnancy record');
    },

    async updatePregnancy(id: string, data: Partial<CreateObgynPregnancyRequest>): Promise<ObgynPregnancy> {
        const response = await api.put<ApiResponse<ObgynPregnancy>>(`/obgyn-pregnancies/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update pregnancy record');
    },

    async deletePregnancy(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/obgyn-pregnancies/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete pregnancy record');
        }
    },
};

export default obgynPregnancyService;
