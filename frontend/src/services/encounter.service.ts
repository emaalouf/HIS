import api from './api';
import type {
    ApiResponse,
    CreateEncounterRequest,
    Encounter,
    EncounterStatus,
} from '../types';

export interface EncounterResponse {
    encounters: Encounter[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetEncountersParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: EncounterStatus;
    patientId?: string;
    providerId?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const encounterService = {
    async getEncounters(params: GetEncountersParams = {}): Promise<EncounterResponse> {
        const response = await api.get<ApiResponse<Encounter[]>>('/encounters', { params });
        if (response.data.success && response.data.data) {
            return {
                encounters: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get encounters');
    },

    async getEncounter(id: string): Promise<Encounter> {
        const response = await api.get<ApiResponse<Encounter>>(`/encounters/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get encounter');
    },

    async createEncounter(data: CreateEncounterRequest): Promise<Encounter> {
        const response = await api.post<ApiResponse<Encounter>>('/encounters', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create encounter');
    },

    async updateEncounter(id: string, data: Partial<CreateEncounterRequest>): Promise<Encounter> {
        const response = await api.put<ApiResponse<Encounter>>(`/encounters/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update encounter');
    },

    async deleteEncounter(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/encounters/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete encounter');
        }
    },
};

export default encounterService;
