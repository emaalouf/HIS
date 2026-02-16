import api from './api';
import type { ApiResponse, ObgynDelivery, CreateObgynDeliveryRequest } from '../types';

export interface ObgynDeliveriesResponse {
    deliveries: ObgynDelivery[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetObgynDeliveriesParams {
    page?: number;
    limit?: number;
    search?: string;
    patientId?: string;
    providerId?: string;
    deliveryMode?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const obgynDeliveryService = {
    async getDeliveries(params: GetObgynDeliveriesParams = {}): Promise<ObgynDeliveriesResponse> {
        const response = await api.get<ApiResponse<ObgynDelivery[]>>('/obgyn-deliveries', { params });
        if (response.data.success && response.data.data) {
            return {
                deliveries: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get delivery records');
    },

    async getDelivery(id: string): Promise<ObgynDelivery> {
        const response = await api.get<ApiResponse<ObgynDelivery>>(`/obgyn-deliveries/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get delivery record');
    },

    async createDelivery(data: CreateObgynDeliveryRequest): Promise<ObgynDelivery> {
        const response = await api.post<ApiResponse<ObgynDelivery>>('/obgyn-deliveries', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create delivery record');
    },

    async updateDelivery(id: string, data: Partial<CreateObgynDeliveryRequest>): Promise<ObgynDelivery> {
        const response = await api.put<ApiResponse<ObgynDelivery>>(`/obgyn-deliveries/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update delivery record');
    },

    async deleteDelivery(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/obgyn-deliveries/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete delivery record');
        }
    },
};

export default obgynDeliveryService;
