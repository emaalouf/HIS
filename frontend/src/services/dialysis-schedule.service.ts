import api from './api';
import type {
    ApiResponse,
    DialysisSchedule,
    CreateDialysisScheduleRequest,
    DialysisScheduleRecurrence,
} from '../types';

export interface DialysisSchedulesResponse {
    schedules: DialysisSchedule[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetDialysisSchedulesParams {
    page?: number;
    limit?: number;
    search?: string;
    patientId?: string;
    providerId?: string;
    stationId?: string;
    recurrence?: DialysisScheduleRecurrence;
    isActive?: boolean;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const dialysisScheduleService = {
    async getSchedules(params: GetDialysisSchedulesParams = {}): Promise<DialysisSchedulesResponse> {
        const response = await api.get<ApiResponse<DialysisSchedule[]>>('/dialysis-schedules', { params });
        if (response.data.success && response.data.data) {
            return {
                schedules: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get dialysis schedules');
    },

    async getSchedule(id: string): Promise<DialysisSchedule> {
        const response = await api.get<ApiResponse<DialysisSchedule>>(`/dialysis-schedules/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get dialysis schedule');
    },

    async createSchedule(data: CreateDialysisScheduleRequest): Promise<DialysisSchedule> {
        const response = await api.post<ApiResponse<DialysisSchedule>>('/dialysis-schedules', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create dialysis schedule');
    },

    async updateSchedule(id: string, data: Partial<CreateDialysisScheduleRequest>): Promise<DialysisSchedule> {
        const response = await api.put<ApiResponse<DialysisSchedule>>(`/dialysis-schedules/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update dialysis schedule');
    },

    async deleteSchedule(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/dialysis-schedules/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete dialysis schedule');
        }
    },
};

export default dialysisScheduleService;
