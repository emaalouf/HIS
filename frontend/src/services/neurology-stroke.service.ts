import api from './api';
import type { ApiResponse, NeurologyStroke, CreateNeurologyStrokeRequest } from '../types';

export interface NeurologyStrokesResponse {
    strokes: NeurologyStroke[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetNeurologyStrokesParams {
    page?: number;
    limit?: number;
    search?: string;
    patientId?: string;
    providerId?: string;
    strokeType?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const neurologyStrokeService = {
    async getStrokes(params: GetNeurologyStrokesParams = {}): Promise<NeurologyStrokesResponse> {
        const response = await api.get<ApiResponse<NeurologyStroke[]>>('/neurology-strokes', { params });
        if (response.data.success && response.data.data) {
            return {
                strokes: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get stroke records');
    },

    async getStroke(id: string): Promise<NeurologyStroke> {
        const response = await api.get<ApiResponse<NeurologyStroke>>(`/neurology-strokes/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get stroke record');
    },

    async createStroke(data: CreateNeurologyStrokeRequest): Promise<NeurologyStroke> {
        const response = await api.post<ApiResponse<NeurologyStroke>>('/neurology-strokes', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create stroke record');
    },

    async updateStroke(id: string, data: Partial<CreateNeurologyStrokeRequest>): Promise<NeurologyStroke> {
        const response = await api.put<ApiResponse<NeurologyStroke>>(`/neurology-strokes/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update stroke record');
    },

    async deleteStroke(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/neurology-strokes/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete stroke record');
        }
    },
};

export default neurologyStrokeService;
