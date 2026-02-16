import api from './api';
import type { ApiResponse, NeurologySeizure, CreateNeurologySeizureRequest } from '../types';

export interface NeurologySeizuresResponse {
    seizures: NeurologySeizure[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetNeurologySeizuresParams {
    page?: number;
    limit?: number;
    search?: string;
    patientId?: string;
    providerId?: string;
    seizureType?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const neurologySeizureService = {
    async getSeizures(params: GetNeurologySeizuresParams = {}): Promise<NeurologySeizuresResponse> {
        const response = await api.get<ApiResponse<NeurologySeizure[]>>('/neurology-seizures', { params });
        if (response.data.success && response.data.data) {
            return {
                seizures: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get seizure records');
    },

    async getSeizure(id: string): Promise<NeurologySeizure> {
        const response = await api.get<ApiResponse<NeurologySeizure>>(`/neurology-seizures/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get seizure record');
    },

    async createSeizure(data: CreateNeurologySeizureRequest): Promise<NeurologySeizure> {
        const response = await api.post<ApiResponse<NeurologySeizure>>('/neurology-seizures', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create seizure record');
    },

    async updateSeizure(id: string, data: Partial<CreateNeurologySeizureRequest>): Promise<NeurologySeizure> {
        const response = await api.put<ApiResponse<NeurologySeizure>>(`/neurology-seizures/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update seizure record');
    },

    async deleteSeizure(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/neurology-seizures/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete seizure record');
        }
    },
};

export default neurologySeizureService;
