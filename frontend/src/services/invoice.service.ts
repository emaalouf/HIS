import api from './api';
import type {
    ApiResponse,
    CreateInvoiceRequest,
    Invoice,
    InvoiceStatus,
} from '../types';

export interface InvoicesResponse {
    invoices: Invoice[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetInvoicesParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: InvoiceStatus;
    patientId?: string;
    encounterId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const invoiceService = {
    async getInvoices(params: GetInvoicesParams = {}): Promise<InvoicesResponse> {
        const response = await api.get<ApiResponse<Invoice[]>>('/invoices', { params });
        if (response.data.success && response.data.data) {
            return {
                invoices: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get invoices');
    },

    async getInvoice(id: string): Promise<Invoice> {
        const response = await api.get<ApiResponse<Invoice>>(`/invoices/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get invoice');
    },

    async createInvoice(data: CreateInvoiceRequest): Promise<Invoice> {
        const response = await api.post<ApiResponse<Invoice>>('/invoices', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create invoice');
    },

    async updateInvoice(id: string, data: Partial<CreateInvoiceRequest>): Promise<Invoice> {
        const response = await api.put<ApiResponse<Invoice>>(`/invoices/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update invoice');
    },

    async deleteInvoice(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/invoices/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete invoice');
        }
    },
};

export default invoiceService;
