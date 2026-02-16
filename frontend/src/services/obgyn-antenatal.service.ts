import api from './api';
import type { ApiResponse, ObgynAntenatal, CreateObgynAntenatalRequest } from '../types';

export interface ObgynAntenatalsResponse {
    antenatals: ObgynAntenatal[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetObgynAntenatalsParams {
    page?: number;
    limit?: number;
    search?: string;
    pregnancyId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const obgynAntenatalService = {
    async getAntenatals(params: GetObgynAntenatalsParams = {}): Promise<ObgynAntenatalsResponse> {
        const response = await api.get<ApiResponse<ObgynAntenatal[]>>('/obgyn-antenatal', { params });
        if (response.data.success && response.data.data) {
            return {
                antenatals: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get antenatal visits');
    },

    async getAntenatal(id: string): Promise<ObgynAntenatal> {
        const response = await api.get<ApiResponse<ObgynAntenatal>>(`/obgyn-antenatal/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get antenatal visit');
    },

    async createAntenatal(data: CreateObgynAntenatalRequest): Promise<ObgynAntenatal> {
        const response = await api.post<ApiResponse<ObgynAntenatal>>('/obgyn-antenatal', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create antenatal visit');
    },

    async updateAntenatal(id: string, data: Partial<CreateObgynAntenatalRequest>): Promise<ObgynAntenatal> {
        const response = await api.put<ApiResponse<ObgynAntenatal>>(`/obgyn-antenatal/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update antenatal visit');
    },

    async deleteAntenatal(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/obgyn-antenatal/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete antenatal visit');
        }
    },
};

export default obgynAntenatalService;
