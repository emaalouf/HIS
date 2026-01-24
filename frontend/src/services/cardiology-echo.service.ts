import api from './api';
import type {
    ApiResponse,
    CardiologyEcho,
    CardiologyTestStatus,
    CreateCardiologyEchoRequest,
} from '../types';

export interface CardiologyEchoResponse {
    echos: CardiologyEcho[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetCardiologyEchoParams {
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

export const cardiologyEchoService = {
    async getEchos(params: GetCardiologyEchoParams = {}): Promise<CardiologyEchoResponse> {
        const response = await api.get<ApiResponse<CardiologyEcho[]>>('/cardiology-echos', { params });
        if (response.data.success && response.data.data) {
            return {
                echos: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get cardiology echos');
    },

    async getEcho(id: string): Promise<CardiologyEcho> {
        const response = await api.get<ApiResponse<CardiologyEcho>>(`/cardiology-echos/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get cardiology echo');
    },

    async createEcho(data: CreateCardiologyEchoRequest): Promise<CardiologyEcho> {
        const response = await api.post<ApiResponse<CardiologyEcho>>('/cardiology-echos', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create cardiology echo');
    },

    async updateEcho(id: string, data: Partial<CreateCardiologyEchoRequest>): Promise<CardiologyEcho> {
        const response = await api.put<ApiResponse<CardiologyEcho>>(`/cardiology-echos/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update cardiology echo');
    },

    async deleteEcho(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/cardiology-echos/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete cardiology echo');
        }
    },
};

export default cardiologyEchoService;
