import api from './api';
import type { ApiResponse, NeurologyEmg, CreateNeurologyEmgRequest } from '../types';

export interface NeurologyEmgsResponse {
    emgs: NeurologyEmg[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetNeurologyEmgsParams {
    page?: number;
    limit?: number;
    search?: string;
    patientId?: string;
    providerId?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const neurologyEmgService = {
    async getEmgs(params: GetNeurologyEmgsParams = {}): Promise<NeurologyEmgsResponse> {
        const response = await api.get<ApiResponse<NeurologyEmg[]>>('/neurology-emgs', { params });
        if (response.data.success && response.data.data) {
            return {
                emgs: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get EMGs');
    },

    async getEmg(id: string): Promise<NeurologyEmg> {
        const response = await api.get<ApiResponse<NeurologyEmg>>(`/neurology-emgs/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get EMG');
    },

    async createEmg(data: CreateNeurologyEmgRequest): Promise<NeurologyEmg> {
        const response = await api.post<ApiResponse<NeurologyEmg>>('/neurology-emgs', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create EMG');
    },

    async updateEmg(id: string, data: Partial<CreateNeurologyEmgRequest>): Promise<NeurologyEmg> {
        const response = await api.put<ApiResponse<NeurologyEmg>>(`/neurology-emgs/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update EMG');
    },

    async deleteEmg(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/neurology-emgs/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete EMG');
        }
    },
};

export default neurologyEmgService;
