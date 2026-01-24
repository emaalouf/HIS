import api from './api';
import type {
    ApiResponse,
    DialysisPrescription,
    CreateDialysisPrescriptionRequest,
} from '../types';

export interface DialysisPrescriptionsResponse {
    prescriptions: DialysisPrescription[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetDialysisPrescriptionsParams {
    page?: number;
    limit?: number;
    search?: string;
    patientId?: string;
    providerId?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const dialysisPrescriptionService = {
    async getPrescriptions(params: GetDialysisPrescriptionsParams = {}): Promise<DialysisPrescriptionsResponse> {
        const response = await api.get<ApiResponse<DialysisPrescription[]>>('/dialysis-prescriptions', { params });
        if (response.data.success && response.data.data) {
            return {
                prescriptions: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get dialysis prescriptions');
    },

    async getPrescription(id: string): Promise<DialysisPrescription> {
        const response = await api.get<ApiResponse<DialysisPrescription>>(`/dialysis-prescriptions/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get dialysis prescription');
    },

    async createPrescription(data: CreateDialysisPrescriptionRequest): Promise<DialysisPrescription> {
        const response = await api.post<ApiResponse<DialysisPrescription>>('/dialysis-prescriptions', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create dialysis prescription');
    },

    async updatePrescription(id: string, data: Partial<CreateDialysisPrescriptionRequest>): Promise<DialysisPrescription> {
        const response = await api.put<ApiResponse<DialysisPrescription>>(`/dialysis-prescriptions/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update dialysis prescription');
    },

    async deletePrescription(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/dialysis-prescriptions/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete dialysis prescription');
        }
    },
};

export default dialysisPrescriptionService;
