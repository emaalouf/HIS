import api from './api';
import type {
    ApiResponse,
    CreateNeurologyVisitRequest,
    NeurologyVisit,
    NeurologyVisitStatus,
} from '../types';

export interface NeurologyVisitsResponse {
    visits: NeurologyVisit[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetNeurologyVisitsParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: NeurologyVisitStatus;
    patientId?: string;
    providerId?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const neurologyService = {
    async getVisits(params: GetNeurologyVisitsParams = {}): Promise<NeurologyVisitsResponse> {
        const response = await api.get<ApiResponse<NeurologyVisit[]>>('/neurology-visits', { params });
        if (response.data.success && response.data.data) {
            return {
                visits: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get neurology visits');
    },

    async getVisit(id: string): Promise<NeurologyVisit> {
        const response = await api.get<ApiResponse<NeurologyVisit>>(`/neurology-visits/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get neurology visit');
    },

    async createVisit(data: CreateNeurologyVisitRequest): Promise<NeurologyVisit> {
        const response = await api.post<ApiResponse<NeurologyVisit>>('/neurology-visits', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create neurology visit');
    },

    async updateVisit(id: string, data: Partial<CreateNeurologyVisitRequest>): Promise<NeurologyVisit> {
        const response = await api.put<ApiResponse<NeurologyVisit>>(`/neurology-visits/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update neurology visit');
    },

    async deleteVisit(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/neurology-visits/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete neurology visit');
        }
    },
};

export default neurologyService;
