import api from './api';
import type { ApiResponse, PedsVaccination, CreatePedsVaccinationRequest } from '../types';

export interface PedsVaccinationsResponse {
    vaccinations: PedsVaccination[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetPedsVaccinationsParams {
    page?: number;
    limit?: number;
    search?: string;
    patientId?: string;
    providerId?: string;
    vaccineName?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const pedsVaccinationService = {
    async getVaccinations(params: GetPedsVaccinationsParams = {}): Promise<PedsVaccinationsResponse> {
        const response = await api.get<ApiResponse<PedsVaccination[]>>('/peds-vaccinations', { params });
        if (response.data.success && response.data.data) {
            return {
                vaccinations: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get vaccinations');
    },

    async getVaccination(id: string): Promise<PedsVaccination> {
        const response = await api.get<ApiResponse<PedsVaccination>>(`/peds-vaccinations/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get vaccination');
    },

    async createVaccination(data: CreatePedsVaccinationRequest): Promise<PedsVaccination> {
        const response = await api.post<ApiResponse<PedsVaccination>>('/peds-vaccinations', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create vaccination');
    },

    async updateVaccination(id: string, data: Partial<CreatePedsVaccinationRequest>): Promise<PedsVaccination> {
        const response = await api.put<ApiResponse<PedsVaccination>>(`/peds-vaccinations/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update vaccination');
    },

    async deleteVaccination(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/peds-vaccinations/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete vaccination');
        }
    },
};

export default pedsVaccinationService;
