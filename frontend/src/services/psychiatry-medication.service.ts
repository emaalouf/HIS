import api from './api';
import type { ApiResponse, PsychiatryMedication, CreatePsychiatryMedicationRequest } from '../types';

export interface PsychiatryMedicationsResponse {
    medications: PsychiatryMedication[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetPsychiatryMedicationsParams {
    page?: number;
    limit?: number;
    search?: string;
    patientId?: string;
    providerId?: string;
    medicationName?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const psychiatryMedicationService = {
    async getMedications(params: GetPsychiatryMedicationsParams = {}): Promise<PsychiatryMedicationsResponse> {
        const response = await api.get<ApiResponse<PsychiatryMedication[]>>('/psychiatry-medication', { params });
        if (response.data.success && response.data.data) {
            return {
                medications: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get medication records');
    },

    async getMedication(id: string): Promise<PsychiatryMedication> {
        const response = await api.get<ApiResponse<PsychiatryMedication>>(`/psychiatry-medication/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get medication record');
    },

    async createMedication(data: CreatePsychiatryMedicationRequest): Promise<PsychiatryMedication> {
        const response = await api.post<ApiResponse<PsychiatryMedication>>('/psychiatry-medication', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create medication record');
    },

    async updateMedication(id: string, data: Partial<CreatePsychiatryMedicationRequest>): Promise<PsychiatryMedication> {
        const response = await api.put<ApiResponse<PsychiatryMedication>>(`/psychiatry-medication/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update medication record');
    },

    async deleteMedication(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/psychiatry-medication/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete medication record');
        }
    },
};

export default psychiatryMedicationService;
