import api from './api';
import type { ApiResponse, Provider, CreateProviderRequest } from '../types';

export interface ProvidersResponse {
    providers: Provider[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetProvidersParams {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    specialty?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const providerService = {
    async getProviders(params: GetProvidersParams = {}): Promise<ProvidersResponse> {
        const response = await api.get<ApiResponse<Provider[]>>('/providers', { params });
        if (response.data.success && response.data.data) {
            return {
                providers: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get providers');
    },

    async getProvider(id: string): Promise<Provider> {
        const response = await api.get<ApiResponse<Provider>>(`/providers/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get provider');
    },

    async createProvider(data: CreateProviderRequest): Promise<Provider> {
        const response = await api.post<ApiResponse<Provider>>('/providers', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create provider');
    },

    async updateProvider(id: string, data: Partial<CreateProviderRequest>): Promise<Provider> {
        const response = await api.put<ApiResponse<Provider>>(`/providers/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update provider');
    },

    async deleteProvider(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/providers/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete provider');
        }
    },
};

export default providerService;
