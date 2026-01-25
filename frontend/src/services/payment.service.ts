import api from './api';
import type {
    ApiResponse,
    CreatePaymentRequest,
    Payment,
    PaymentMethod,
} from '../types';

export interface PaymentsResponse {
    payments: Payment[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetPaymentsParams {
    page?: number;
    limit?: number;
    method?: PaymentMethod;
    patientId?: string;
    invoiceId?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const paymentService = {
    async getPayments(params: GetPaymentsParams = {}): Promise<PaymentsResponse> {
        const response = await api.get<ApiResponse<Payment[]>>('/payments', { params });
        if (response.data.success && response.data.data) {
            return {
                payments: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get payments');
    },

    async getPayment(id: string): Promise<Payment> {
        const response = await api.get<ApiResponse<Payment>>(`/payments/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get payment');
    },

    async createPayment(data: CreatePaymentRequest): Promise<Payment> {
        const response = await api.post<ApiResponse<Payment>>('/payments', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create payment');
    },

    async updatePayment(id: string, data: Partial<CreatePaymentRequest>): Promise<Payment> {
        const response = await api.put<ApiResponse<Payment>>(`/payments/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update payment');
    },

    async deletePayment(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/payments/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete payment');
        }
    },
};

export default paymentService;
