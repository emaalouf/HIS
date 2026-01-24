import api from './api';
import type {
    ApiResponse,
    DialysisSession,
    DialysisStatus,
    CreateDialysisSessionRequest,
} from '../types';

export interface DialysisSessionsResponse {
    sessions: DialysisSession[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetDialysisSessionsParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: DialysisStatus;
    patientId?: string;
    providerId?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const dialysisService = {
    async getSessions(params: GetDialysisSessionsParams = {}): Promise<DialysisSessionsResponse> {
        const response = await api.get<ApiResponse<DialysisSession[]>>('/dialysis-sessions', { params });
        if (response.data.success && response.data.data) {
            return {
                sessions: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get dialysis sessions');
    },

    async getSession(id: string): Promise<DialysisSession> {
        const response = await api.get<ApiResponse<DialysisSession>>(`/dialysis-sessions/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get dialysis session');
    },

    async createSession(data: CreateDialysisSessionRequest): Promise<DialysisSession> {
        const response = await api.post<ApiResponse<DialysisSession>>('/dialysis-sessions', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create dialysis session');
    },

    async updateSession(id: string, data: Partial<CreateDialysisSessionRequest>): Promise<DialysisSession> {
        const response = await api.put<ApiResponse<DialysisSession>>(`/dialysis-sessions/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update dialysis session');
    },

    async deleteSession(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/dialysis-sessions/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete dialysis session');
        }
    },
};

export default dialysisService;
