import api from './api';
import type {
    ApiResponse,
    CardiologyEcg,
    CardiologyTestStatus,
    CreateCardiologyEcgRequest,
} from '../types';

export interface CardiologyEcgResponse {
    ecgs: CardiologyEcg[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetCardiologyEcgParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: CardiologyTestStatus;
    patientId?: string;
    providerId?: string;
    visitId?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const cardiologyEcgService = {
    async getEcgs(params: GetCardiologyEcgParams = {}): Promise<CardiologyEcgResponse> {
        const response = await api.get<ApiResponse<CardiologyEcg[]>>('/cardiology-ecgs', { params });
        if (response.data.success && response.data.data) {
            return {
                ecgs: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get cardiology ECGs');
    },

    async getEcg(id: string): Promise<CardiologyEcg> {
        const response = await api.get<ApiResponse<CardiologyEcg>>(`/cardiology-ecgs/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get cardiology ECG');
    },

    async createEcg(data: CreateCardiologyEcgRequest): Promise<CardiologyEcg> {
        const response = await api.post<ApiResponse<CardiologyEcg>>('/cardiology-ecgs', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create cardiology ECG');
    },

    async updateEcg(id: string, data: Partial<CreateCardiologyEcgRequest>): Promise<CardiologyEcg> {
        const response = await api.put<ApiResponse<CardiologyEcg>>(`/cardiology-ecgs/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update cardiology ECG');
    },

    async deleteEcg(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/cardiology-ecgs/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete cardiology ECG');
        }
    },
};

export default cardiologyEcgService;
