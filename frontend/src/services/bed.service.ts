import api from './api';
import type { ApiResponse, Bed, BedStatus, CreateBedRequest } from '../types';

export interface BedsResponse {
    beds: Bed[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetBedsParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: BedStatus;
    wardId?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const bedService = {
    async getBeds(params: GetBedsParams = {}): Promise<BedsResponse> {
        const response = await api.get<ApiResponse<Bed[]>>('/beds', { params });
        if (response.data.success && response.data.data) {
            return {
                beds: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get beds');
    },

    async getBed(id: string): Promise<Bed> {
        const response = await api.get<ApiResponse<Bed>>(`/beds/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get bed');
    },

    async createBed(data: CreateBedRequest): Promise<Bed> {
        const response = await api.post<ApiResponse<Bed>>('/beds', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create bed');
    },

    async updateBed(id: string, data: Partial<CreateBedRequest>): Promise<Bed> {
        const response = await api.put<ApiResponse<Bed>>(`/beds/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update bed');
    },

    async deleteBed(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/beds/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete bed');
        }
    },
};

export default bedService;
