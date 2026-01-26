import api from './api';
import type {
    Surgery,
    CreateSurgeryRequest,
    AddTeamMemberRequest,
    RemoveTeamMemberRequest,
    ApiResponse,
    SurgeryStatus,
    SurgeryPriority,
} from '../types';

export interface SurgeriesResponse {
    surgeries: Surgery[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetSurgeriesParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: SurgeryStatus;
    priority?: SurgeryPriority;
    patientId?: string;
    theaterId?: string;
    admissionId?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const surgeryService = {
    async getSurgeries(params: GetSurgeriesParams = {}): Promise<SurgeriesResponse> {
        const response = await api.get<ApiResponse<Surgery[]>>('/surgeries', { params });
        if (response.data.success && response.data.data) {
            return {
                surgeries: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get surgeries');
    },

    async getSurgery(id: string): Promise<Surgery> {
        const response = await api.get<ApiResponse<Surgery>>(`/surgeries/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get surgery');
    },

    async createSurgery(data: CreateSurgeryRequest): Promise<Surgery> {
        const response = await api.post<ApiResponse<Surgery>>('/surgeries', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create surgery');
    },

    async updateSurgery(id: string, data: Partial<CreateSurgeryRequest>): Promise<Surgery> {
        const response = await api.put<ApiResponse<Surgery>>(`/surgeries/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update surgery');
    },

    async updateSurgeryStatus(id: string, status: SurgeryStatus, actualStart?: string | null, actualEnd?: string | null): Promise<Surgery> {
        const response = await api.patch<ApiResponse<Surgery>>(`/surgeries/${id}/status`, { status, actualStart, actualEnd });
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update surgery status');
    },

    async addTeamMember(data: AddTeamMemberRequest): Promise<Surgery> {
        const response = await api.post<ApiResponse<Surgery>>(`/surgeries/${data.surgeryId}/team`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to add team member');
    },

    async removeTeamMember(data: RemoveTeamMemberRequest): Promise<void> {
        const response = await api.delete<ApiResponse>(`/surgeries/${data.surgeryId}/team`, { data });
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to remove team member');
        }
    },

    async deleteSurgery(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/surgeries/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete surgery');
        }
    },
};

export default surgeryService;