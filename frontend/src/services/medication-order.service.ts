import api from './api';
import type {
    ApiResponse,
    CreateMedicationOrderRequest,
    MedicationOrder,
    MedicationOrderStatus,
} from '../types';

export interface MedicationOrderResponse {
    orders: MedicationOrder[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetMedicationOrdersParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: MedicationOrderStatus;
    patientId?: string;
    providerId?: string;
    encounterId?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const medicationOrderService = {
    async getOrders(params: GetMedicationOrdersParams = {}): Promise<MedicationOrderResponse> {
        const response = await api.get<ApiResponse<MedicationOrder[]>>('/medication-orders', { params });
        if (response.data.success && response.data.data) {
            return {
                orders: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get medication orders');
    },

    async getOrder(id: string): Promise<MedicationOrder> {
        const response = await api.get<ApiResponse<MedicationOrder>>(`/medication-orders/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get medication order');
    },

    async createOrder(data: CreateMedicationOrderRequest): Promise<MedicationOrder> {
        const response = await api.post<ApiResponse<MedicationOrder>>('/medication-orders', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create medication order');
    },

    async updateOrder(id: string, data: Partial<CreateMedicationOrderRequest>): Promise<MedicationOrder> {
        const response = await api.put<ApiResponse<MedicationOrder>>(`/medication-orders/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update medication order');
    },

    async deleteOrder(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/medication-orders/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete medication order');
        }
    },
};

export default medicationOrderService;
