import api from './api';
import type {
    ApiResponse,
    DialysisMedicationOrder,
    CreateDialysisMedicationOrderRequest,
} from '../types';

export interface DialysisMedicationOrdersResponse {
    orders: DialysisMedicationOrder[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetDialysisMedicationOrdersParams {
    page?: number;
    limit?: number;
    search?: string;
    patientId?: string;
    isActive?: boolean;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const dialysisMedicationService = {
    async getOrders(params: GetDialysisMedicationOrdersParams = {}): Promise<DialysisMedicationOrdersResponse> {
        const response = await api.get<ApiResponse<DialysisMedicationOrder[]>>('/dialysis-medications', { params });
        if (response.data.success && response.data.data) {
            return {
                orders: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get dialysis medications');
    },

    async getOrder(id: string): Promise<DialysisMedicationOrder> {
        const response = await api.get<ApiResponse<DialysisMedicationOrder>>(`/dialysis-medications/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get dialysis medication');
    },

    async createOrder(data: CreateDialysisMedicationOrderRequest): Promise<DialysisMedicationOrder> {
        const response = await api.post<ApiResponse<DialysisMedicationOrder>>('/dialysis-medications', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create dialysis medication');
    },

    async updateOrder(id: string, data: Partial<CreateDialysisMedicationOrderRequest>): Promise<DialysisMedicationOrder> {
        const response = await api.put<ApiResponse<DialysisMedicationOrder>>(`/dialysis-medications/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update dialysis medication');
    },

    async deleteOrder(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/dialysis-medications/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete dialysis medication');
        }
    },
};

export default dialysisMedicationService;
