import api from './api';
import type { ApiResponse, PsychiatryTherapy, CreatePsychiatryTherapyRequest } from '../types';

export interface PsychiatryTherapiesResponse {
    therapies: PsychiatryTherapy[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetPsychiatryTherapiesParams {
    page?: number;
    limit?: number;
    search?: string;
    patientId?: string;
    providerId?: string;
    therapyType?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const psychiatryTherapyService = {
    async getTherapies(params: GetPsychiatryTherapiesParams = {}): Promise<PsychiatryTherapiesResponse> {
        const response = await api.get<ApiResponse<PsychiatryTherapy[]>>('/psychiatry-therapy', { params });
        if (response.data.success && response.data.data) {
            return {
                therapies: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get therapy sessions');
    },

    async getTherapy(id: string): Promise<PsychiatryTherapy> {
        const response = await api.get<ApiResponse<PsychiatryTherapy>>(`/psychiatry-therapy/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get therapy session');
    },

    async createTherapy(data: CreatePsychiatryTherapyRequest): Promise<PsychiatryTherapy> {
        const response = await api.post<ApiResponse<PsychiatryTherapy>>('/psychiatry-therapy', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create therapy session');
    },

    async updateTherapy(id: string, data: Partial<CreatePsychiatryTherapyRequest>): Promise<PsychiatryTherapy> {
        const response = await api.put<ApiResponse<PsychiatryTherapy>>(`/psychiatry-therapy/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update therapy session');
    },

    async deleteTherapy(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/psychiatry-therapy/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete therapy session');
        }
    },
};

export default psychiatryTherapyService;
