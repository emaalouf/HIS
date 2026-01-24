import api from './api';
import type {
    ApiResponse,
    CkdStage,
    CreateNephrologyVisitRequest,
    NephrologyVisit,
    NephrologyVisitStatus,
} from '../types';

export interface NephrologyVisitsResponse {
    visits: NephrologyVisit[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetNephrologyVisitsParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: NephrologyVisitStatus;
    patientId?: string;
    providerId?: string;
    ckdStage?: CkdStage;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const nephrologyService = {
    async getVisits(params: GetNephrologyVisitsParams = {}): Promise<NephrologyVisitsResponse> {
        const response = await api.get<ApiResponse<NephrologyVisit[]>>('/nephrology-visits', { params });
        if (response.data.success && response.data.data) {
            return {
                visits: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get nephrology visits');
    },

    async getVisit(id: string): Promise<NephrologyVisit> {
        const response = await api.get<ApiResponse<NephrologyVisit>>(`/nephrology-visits/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get nephrology visit');
    },

    async createVisit(data: CreateNephrologyVisitRequest): Promise<NephrologyVisit> {
        const response = await api.post<ApiResponse<NephrologyVisit>>('/nephrology-visits', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create nephrology visit');
    },

    async updateVisit(id: string, data: Partial<CreateNephrologyVisitRequest>): Promise<NephrologyVisit> {
        const response = await api.put<ApiResponse<NephrologyVisit>>(`/nephrology-visits/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update nephrology visit');
    },

    async deleteVisit(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/nephrology-visits/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete nephrology visit');
        }
    },
};

export default nephrologyService;
