import api from './api';
import type { ApiResponse, NeurologyEeg, CreateNeurologyEegRequest } from '../types';

export interface NeurologyEegsResponse {
    eegs: NeurologyEeg[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetNeurologyEegsParams {
    page?: number;
    limit?: number;
    search?: string;
    patientId?: string;
    providerId?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const neurologyEegService = {
    async getEegs(params: GetNeurologyEegsParams = {}): Promise<NeurologyEegsResponse> {
        const response = await api.get<ApiResponse<NeurologyEeg[]>>('/neurology-eegs', { params });
        if (response.data.success && response.data.data) {
            return {
                eegs: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get EEGs');
    },

    async getEeg(id: string): Promise<NeurologyEeg> {
        const response = await api.get<ApiResponse<NeurologyEeg>>(`/neurology-eegs/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get EEG');
    },

    async createEeg(data: CreateNeurologyEegRequest): Promise<NeurologyEeg> {
        const response = await api.post<ApiResponse<NeurologyEeg>>('/neurology-eegs', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create EEG');
    },

    async updateEeg(id: string, data: Partial<CreateNeurologyEegRequest>): Promise<NeurologyEeg> {
        const response = await api.put<ApiResponse<NeurologyEeg>>(`/neurology-eegs/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update EEG');
    },

    async deleteEeg(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/neurology-eegs/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete EEG');
        }
    },
};

export default neurologyEegService;
