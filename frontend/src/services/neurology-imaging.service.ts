import api from './api';
import type { ApiResponse, NeurologyImaging, CreateNeurologyImagingRequest } from '../types';

export interface NeurologyImagingsResponse {
    imagings: NeurologyImaging[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetNeurologyImagingsParams {
    page?: number;
    limit?: number;
    search?: string;
    patientId?: string;
    providerId?: string;
    status?: string;
    imagingType?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const neurologyImagingService = {
    async getImagings(params: GetNeurologyImagingsParams = {}): Promise<NeurologyImagingsResponse> {
        const response = await api.get<ApiResponse<NeurologyImaging[]>>('/neurology-imaging', { params });
        if (response.data.success && response.data.data) {
            return {
                imagings: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get imaging studies');
    },

    async getImaging(id: string): Promise<NeurologyImaging> {
        const response = await api.get<ApiResponse<NeurologyImaging>>(`/neurology-imaging/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get imaging study');
    },

    async createImaging(data: CreateNeurologyImagingRequest): Promise<NeurologyImaging> {
        const response = await api.post<ApiResponse<NeurologyImaging>>('/neurology-imaging', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create imaging study');
    },

    async updateImaging(id: string, data: Partial<CreateNeurologyImagingRequest>): Promise<NeurologyImaging> {
        const response = await api.put<ApiResponse<NeurologyImaging>>(`/neurology-imaging/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update imaging study');
    },

    async deleteImaging(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/neurology-imaging/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete imaging study');
        }
    },
};

export default neurologyImagingService;
