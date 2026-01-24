import api from './api';
import type {
    ApiResponse,
    CardiologyVisit,
    CardiologyVisitStatus,
    CreateCardiologyVisitRequest,
} from '../types';

export interface CardiologyVisitsResponse {
    visits: CardiologyVisit[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetCardiologyVisitsParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: CardiologyVisitStatus;
    patientId?: string;
    providerId?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const cardiologyService = {
    async getVisits(params: GetCardiologyVisitsParams = {}): Promise<CardiologyVisitsResponse> {
        const response = await api.get<ApiResponse<CardiologyVisit[]>>('/cardiology-visits', { params });
        if (response.data.success && response.data.data) {
            return {
                visits: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get cardiology visits');
    },

    async getVisit(id: string): Promise<CardiologyVisit> {
        const response = await api.get<ApiResponse<CardiologyVisit>>(`/cardiology-visits/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get cardiology visit');
    },

    async createVisit(data: CreateCardiologyVisitRequest): Promise<CardiologyVisit> {
        const response = await api.post<ApiResponse<CardiologyVisit>>('/cardiology-visits', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create cardiology visit');
    },

    async updateVisit(id: string, data: Partial<CreateCardiologyVisitRequest>): Promise<CardiologyVisit> {
        const response = await api.put<ApiResponse<CardiologyVisit>>(`/cardiology-visits/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update cardiology visit');
    },

    async deleteVisit(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/cardiology-visits/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete cardiology visit');
        }
    },
};

export default cardiologyService;
