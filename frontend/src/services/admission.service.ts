import api from './api';
import type {
    Admission,
    AdmissionStatus,
    ApiResponse,
    CreateAdmissionRequest,
} from '../types';

export interface AdmissionsResponse {
    admissions: Admission[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetAdmissionsParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: AdmissionStatus;
    patientId?: string;
    providerId?: string;
    wardId?: string;
    bedId?: string;
    departmentId?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const admissionService = {
    async getAdmissions(params: GetAdmissionsParams = {}): Promise<AdmissionsResponse> {
        const response = await api.get<ApiResponse<Admission[]>>('/admissions', { params });
        if (response.data.success && response.data.data) {
            return {
                admissions: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get admissions');
    },

    async getAdmission(id: string): Promise<Admission> {
        const response = await api.get<ApiResponse<Admission>>(`/admissions/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get admission');
    },

    async createAdmission(data: CreateAdmissionRequest): Promise<Admission> {
        const response = await api.post<ApiResponse<Admission>>('/admissions', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create admission');
    },

    async updateAdmission(id: string, data: Partial<CreateAdmissionRequest>): Promise<Admission> {
        const response = await api.put<ApiResponse<Admission>>(`/admissions/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update admission');
    },

    async deleteAdmission(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/admissions/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete admission');
        }
    },
};

export default admissionService;
