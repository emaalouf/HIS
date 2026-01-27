import api from './api';
import type {
    ApiResponse,
    CreateGastroColonoscopyRequest,
    EndoscopyStatus,
    GastroColonoscopy,
} from '../types';

export interface GastroColonoscopiesResponse {
    colonoscopies: GastroColonoscopy[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetGastroColonoscopiesParams {
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

export const gastroColonoscopyService = {
    async getColonoscopies(params: GetGastroColonoscopiesParams = {}): Promise<GastroColonoscopiesResponse> {
        const response = await api.get<ApiResponse<GastroColonoscopy[]>>('/gastro-colonoscopies', { params });
        if (response.data.success && response.data.data) {
            return {
                colonoscopies: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get colonoscopies');
    },

    async getColonoscopy(id: string): Promise<GastroColonoscopy> {
        const response = await api.get<ApiResponse<GastroColonoscopy>>(`/gastro-colonoscopies/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get colonoscopy');
    },

    async createColonoscopy(data: CreateGastroColonoscopyRequest): Promise<GastroColonoscopy> {
        const response = await api.post<ApiResponse<GastroColonoscopy>>('/gastro-colonoscopies', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create colonoscopy');
    },

    async updateColonoscopy(id: string, data: Partial<CreateGastroColonoscopyRequest>): Promise<GastroColonoscopy> {
        const response = await api.put<ApiResponse<GastroColonoscopy>>(`/gastro-colonoscopies/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update colonoscopy');
    },

    async deleteColonoscopy(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/gastro-colonoscopies/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete colonoscopy');
        }
    },
};

export default gastroColonoscopyService;
