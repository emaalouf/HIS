import api from './api';
import type {
    ApiResponse,
    CardiologyMedicationOrder,
    CreateCardiologyMedicationOrderRequest,
} from '../types';

export interface CardiologyMedicationOrdersResponse {
    orders: CardiologyMedicationOrder[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetCardiologyMedicationOrdersParams {
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

export const cardiologyMedicationService = {
    async getOrders(params: GetCardiologyMedicationOrdersParams = {}): Promise<CardiologyMedicationOrdersResponse> {
        const response = await api.get<ApiResponse<CardiologyMedicationOrder[]>>('/cardiology-medications', { params });
        if (response.data.success && response.data.data) {
            return {
                orders: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get cardiology medication orders');
    },

    async getOrder(id: string): Promise<CardiologyMedicationOrder> {
        const response = await api.get<ApiResponse<CardiologyMedicationOrder>>(`/cardiology-medications/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get cardiology medication order');
    },

    async createOrder(data: CreateCardiologyMedicationOrderRequest): Promise<CardiologyMedicationOrder> {
        const response = await api.post<ApiResponse<CardiologyMedicationOrder>>('/cardiology-medications', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create cardiology medication order');
    },

    async updateOrder(id: string, data: Partial<CreateCardiologyMedicationOrderRequest>): Promise<CardiologyMedicationOrder> {
        const response = await api.put<ApiResponse<CardiologyMedicationOrder>>(`/cardiology-medications/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update cardiology medication order');
    },

    async deleteOrder(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/cardiology-medications/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete cardiology medication order');
        }
    },
};

export default cardiologyMedicationService;
