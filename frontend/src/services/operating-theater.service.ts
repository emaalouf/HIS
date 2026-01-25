import api from './api';
import type {
    OperatingTheater,
    CreateOperatingTheaterRequest,
    ApiResponse,
} from '../types';

export interface OperatingTheatersResponse {
    theaters: OperatingTheater[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetOperatingTheatersParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const operatingTheaterService = {
    async getOperatingTheaters(params: GetOperatingTheatersParams = {}): Promise<OperatingTheatersResponse> {
        const response = await api.get<ApiResponse<OperatingTheater[]>>('/operating-theaters', { params });
        if (response.data.success && response.data.data) {
            return {
                theaters: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get operating theaters');
    },

    async getOperatingTheater(id: string): Promise<OperatingTheater> {
        const response = await api.get<ApiResponse<OperatingTheater>>(`/operating-theaters/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get operating theater');
    },

    async createOperatingTheater(data: CreateOperatingTheaterRequest): Promise<OperatingTheater> {
        const response = await api.post<ApiResponse<OperatingTheater>>('/operating-theaters', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create operating theater');
    },

    async updateOperatingTheater(id: string, data: Partial<CreateOperatingTheaterRequest>): Promise<OperatingTheater> {
        const response = await api.put<ApiResponse<OperatingTheater>>(`/operating-theaters/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update operating theater');
    },

    async deleteOperatingTheater(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/operating-theaters/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete operating theater');
        }
    },
};

export default operatingTheaterService;