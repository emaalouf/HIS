import api from './api';
import type {
    ApiResponse,
    CreateGastroEndoscopyRequest,
    EndoscopyStatus,
    GastroEndoscopy,
} from '../types';

export interface GastroEndoscopiesResponse {
    endoscopies: GastroEndoscopy[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetGastroEndoscopiesParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: EndoscopyStatus;
    patientId?: string;
    providerId?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const gastroEndoscopyService = {
    async getEndoscopies(params: GetGastroEndoscopiesParams = {}): Promise<GastroEndoscopiesResponse> {
        const response = await api.get<ApiResponse<GastroEndoscopy[]>>('/gastro-endoscopies', { params });
        if (response.data.success && response.data.data) {
            return {
                endoscopies: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get endoscopies');
    },

    async getEndoscopy(id: string): Promise<GastroEndoscopy> {
        const response = await api.get<ApiResponse<GastroEndoscopy>>(`/gastro-endoscopies/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get endoscopy');
    },

    async createEndoscopy(data: CreateGastroEndoscopyRequest): Promise<GastroEndoscopy> {
        const response = await api.post<ApiResponse<GastroEndoscopy>>('/gastro-endoscopies', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create endoscopy');
    },

    async updateEndoscopy(id: string, data: Partial<CreateGastroEndoscopyRequest>): Promise<GastroEndoscopy> {
        const response = await api.put<ApiResponse<GastroEndoscopy>>(`/gastro-endoscopies/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update endoscopy');
    },

    async deleteEndoscopy(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/gastro-endoscopies/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete endoscopy');
        }
    },
};

export default gastroEndoscopyService;
