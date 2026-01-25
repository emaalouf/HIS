import api from './api';
import type {
    ApiResponse,
    ClinicalOrder,
    CreateClinicalOrderRequest,
    OrderStatus,
    OrderType,
} from '../types';

export interface ClinicalOrderResponse {
    orders: ClinicalOrder[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetClinicalOrdersParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: OrderStatus;
    orderType?: OrderType;
    patientId?: string;
    providerId?: string;
    encounterId?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const clinicalOrderService = {
    async getOrders(params: GetClinicalOrdersParams = {}): Promise<ClinicalOrderResponse> {
        const response = await api.get<ApiResponse<ClinicalOrder[]>>('/clinical-orders', { params });
        if (response.data.success && response.data.data) {
            return {
                orders: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get orders');
    },

    async getOrder(id: string): Promise<ClinicalOrder> {
        const response = await api.get<ApiResponse<ClinicalOrder>>(`/clinical-orders/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get order');
    },

    async createOrder(data: CreateClinicalOrderRequest): Promise<ClinicalOrder> {
        const response = await api.post<ApiResponse<ClinicalOrder>>('/clinical-orders', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create order');
    },

    async updateOrder(id: string, data: Partial<CreateClinicalOrderRequest>): Promise<ClinicalOrder> {
        const response = await api.put<ApiResponse<ClinicalOrder>>(`/clinical-orders/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update order');
    },

    async deleteOrder(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/clinical-orders/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete order');
        }
    },
};

export default clinicalOrderService;
