import api from './api';
import type {
    ApiResponse,
    DialysisStation,
    CreateDialysisStationRequest,
} from '../types';

export interface DialysisStationsResponse {
    stations: DialysisStation[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetDialysisStationsParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const dialysisStationService = {
    async getStations(params: GetDialysisStationsParams = {}): Promise<DialysisStationsResponse> {
        const response = await api.get<ApiResponse<DialysisStation[]>>('/dialysis-stations', { params });
        if (response.data.success && response.data.data) {
            return {
                stations: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get dialysis stations');
    },

    async getStation(id: string): Promise<DialysisStation> {
        const response = await api.get<ApiResponse<DialysisStation>>(`/dialysis-stations/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get dialysis station');
    },

    async createStation(data: CreateDialysisStationRequest): Promise<DialysisStation> {
        const response = await api.post<ApiResponse<DialysisStation>>('/dialysis-stations', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create dialysis station');
    },

    async updateStation(id: string, data: Partial<CreateDialysisStationRequest>): Promise<DialysisStation> {
        const response = await api.put<ApiResponse<DialysisStation>>(`/dialysis-stations/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update dialysis station');
    },

    async deleteStation(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/dialysis-stations/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete dialysis station');
        }
    },
};

export default dialysisStationService;
