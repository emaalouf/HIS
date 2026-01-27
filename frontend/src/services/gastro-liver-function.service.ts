import api from './api';
import type {
    ApiResponse,
    CreateGastroLiverFunctionRequest,
    GastroLiverFunction,
} from '../types';

export interface GastroLiverFunctionsResponse {
    liverFunctions: GastroLiverFunction[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetGastroLiverFunctionsParams {
    page?: number;
    limit?: number;
    search?: string;
    patientId?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const gastroLiverFunctionService = {
    async getLiverFunctions(params: GetGastroLiverFunctionsParams = {}): Promise<GastroLiverFunctionsResponse> {
        const response = await api.get<ApiResponse<GastroLiverFunction[]>>('/gastro-liver-functions', { params });
        if (response.data.success && response.data.data) {
            return {
                liverFunctions: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get liver function tests');
    },

    async getLiverFunction(id: string): Promise<GastroLiverFunction> {
        const response = await api.get<ApiResponse<GastroLiverFunction>>(`/gastro-liver-functions/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get liver function test');
    },

    async createLiverFunction(data: CreateGastroLiverFunctionRequest): Promise<GastroLiverFunction> {
        const response = await api.post<ApiResponse<GastroLiverFunction>>('/gastro-liver-functions', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create liver function test');
    },

    async updateLiverFunction(id: string, data: Partial<CreateGastroLiverFunctionRequest>): Promise<GastroLiverFunction> {
        const response = await api.put<ApiResponse<GastroLiverFunction>>(`/gastro-liver-functions/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update liver function test');
    },

    async deleteLiverFunction(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/gastro-liver-functions/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete liver function test');
        }
    },
};

export default gastroLiverFunctionService;
