import api from './api';
import type {
    ApiResponse,
    CreateMedicationAdministrationRequest,
    MedicationAdministration,
    MedicationAdministrationStatus,
} from '../types';

export interface MedicationAdministrationResponse {
    administrations: MedicationAdministration[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetMedicationAdministrationsParams {
    page?: number;
    limit?: number;
    status?: MedicationAdministrationStatus;
    patientId?: string;
    medicationOrderId?: string;
    administeredById?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const medicationAdministrationService = {
    async getAdministrations(params: GetMedicationAdministrationsParams = {}): Promise<MedicationAdministrationResponse> {
        const response = await api.get<ApiResponse<MedicationAdministration[]>>('/medication-administrations', { params });
        if (response.data.success && response.data.data) {
            return {
                administrations: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get administrations');
    },

    async getAdministration(id: string): Promise<MedicationAdministration> {
        const response = await api.get<ApiResponse<MedicationAdministration>>(`/medication-administrations/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get administration');
    },

    async createAdministration(data: CreateMedicationAdministrationRequest): Promise<MedicationAdministration> {
        const response = await api.post<ApiResponse<MedicationAdministration>>('/medication-administrations', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create administration');
    },

    async updateAdministration(id: string, data: Partial<CreateMedicationAdministrationRequest>): Promise<MedicationAdministration> {
        const response = await api.put<ApiResponse<MedicationAdministration>>(`/medication-administrations/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update administration');
    },

    async deleteAdministration(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/medication-administrations/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete administration');
        }
    },
};

export default medicationAdministrationService;
