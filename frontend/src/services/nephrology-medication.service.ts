import api from './api';
import type {
    ApiResponse,
    CreateNephrologyMedicationOrderRequest,
    NephrologyMedicationOrder,
} from '../types';

export interface NephrologyMedicationResponse {
    orders: NephrologyMedicationOrder[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetNephrologyMedicationParams {
    page?: number;
    limit?: number;
    search?: string;
    patientId?: string;
    providerId?: string;
    isActive?: boolean;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const nephrologyMedicationService = {
    async getOrders(params: GetNephrologyMedicationParams = {}): Promise<NephrologyMedicationResponse> {
        const response = await api.get<ApiResponse<NephrologyMedicationOrder[]>>('/nephrology-medications', { params });
        if (response.data.success && response.data.data) {
            return {
                orders: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get nephrology medication orders');
    },

    async getOrder(id: string): Promise<NephrologyMedicationOrder> {
        const response = await api.get<ApiResponse<NephrologyMedicationOrder>>(`/nephrology-medications/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get nephrology medication order');
    },

    async createOrder(data: CreateNephrologyMedicationOrderRequest): Promise<NephrologyMedicationOrder> {
        const response = await api.post<ApiResponse<NephrologyMedicationOrder>>('/nephrology-medications', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create nephrology medication order');
    },

    async updateOrder(
        id: string,
        data: Partial<CreateNephrologyMedicationOrderRequest>
    ): Promise<NephrologyMedicationOrder> {
        const response = await api.put<ApiResponse<NephrologyMedicationOrder>>(`/nephrology-medications/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update nephrology medication order');
    },

    async deleteOrder(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/nephrology-medications/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete nephrology medication order');
        }
    },
};

export default nephrologyMedicationService;
