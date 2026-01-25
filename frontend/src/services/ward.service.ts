import api from './api';
import type { ApiResponse, CreateWardRequest, Ward } from '../types';

export interface WardsResponse {
    wards: Ward[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetWardsParams {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    departmentId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const wardService = {
    async getWards(params: GetWardsParams = {}): Promise<WardsResponse> {
        const response = await api.get<ApiResponse<Ward[]>>('/wards', { params });
        if (response.data.success && response.data.data) {
            return {
                wards: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get wards');
    },

    async getWard(id: string): Promise<Ward> {
        const response = await api.get<ApiResponse<Ward>>(`/wards/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get ward');
    },

    async createWard(data: CreateWardRequest): Promise<Ward> {
        const response = await api.post<ApiResponse<Ward>>('/wards', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create ward');
    },

    async updateWard(id: string, data: Partial<CreateWardRequest>): Promise<Ward> {
        const response = await api.put<ApiResponse<Ward>>(`/wards/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update ward');
    },

    async deleteWard(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/wards/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete ward');
        }
    },
};

export default wardService;
