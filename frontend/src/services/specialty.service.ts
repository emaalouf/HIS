import api from './api';
import type { ApiResponse, Specialty, CreateSpecialtyRequest } from '../types';

export interface SpecialtiesResponse {
    specialties: Specialty[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetSpecialtiesParams {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const specialtyService = {
    async getSpecialties(params: GetSpecialtiesParams = {}): Promise<SpecialtiesResponse> {
        const response = await api.get<ApiResponse<Specialty[]>>('/specialties', { params });
        if (response.data.success && response.data.data) {
            return {
                specialties: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get specialties');
    },

    async getSpecialty(id: string): Promise<Specialty> {
        const response = await api.get<ApiResponse<Specialty>>(`/specialties/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get specialty');
    },

    async createSpecialty(data: CreateSpecialtyRequest): Promise<Specialty> {
        const response = await api.post<ApiResponse<Specialty>>('/specialties', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create specialty');
    },

    async updateSpecialty(id: string, data: Partial<CreateSpecialtyRequest>): Promise<Specialty> {
        const response = await api.put<ApiResponse<Specialty>>(`/specialties/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update specialty');
    },

    async deleteSpecialty(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/specialties/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete specialty');
        }
    },
};

export default specialtyService;
