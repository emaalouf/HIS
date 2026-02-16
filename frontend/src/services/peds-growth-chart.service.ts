import api from './api';
import type { ApiResponse, PedsGrowthChart, CreatePedsGrowthChartRequest } from '../types';

export interface PedsGrowthChartsResponse {
    growthCharts: PedsGrowthChart[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetPedsGrowthChartsParams {
    page?: number;
    limit?: number;
    search?: string;
    patientId?: string;
    providerId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const pedsGrowthChartService = {
    async getGrowthCharts(params: GetPedsGrowthChartsParams = {}): Promise<PedsGrowthChartsResponse> {
        const response = await api.get<ApiResponse<PedsGrowthChart[]>>('/peds-growth-charts', { params });
        if (response.data.success && response.data.data) {
            return {
                growthCharts: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get growth charts');
    },

    async getGrowthChart(id: string): Promise<PedsGrowthChart> {
        const response = await api.get<ApiResponse<PedsGrowthChart>>(`/peds-growth-charts/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get growth chart');
    },

    async createGrowthChart(data: CreatePedsGrowthChartRequest): Promise<PedsGrowthChart> {
        const response = await api.post<ApiResponse<PedsGrowthChart>>('/peds-growth-charts', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create growth chart');
    },

    async updateGrowthChart(id: string, data: Partial<CreatePedsGrowthChartRequest>): Promise<PedsGrowthChart> {
        const response = await api.put<ApiResponse<PedsGrowthChart>>(`/peds-growth-charts/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update growth chart');
    },

    async deleteGrowthChart(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/peds-growth-charts/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete growth chart');
        }
    },
};

export default pedsGrowthChartService;
