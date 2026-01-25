import api from './api';
import type { ApiResponse, CreateDepartmentRequest, Department } from '../types';

export interface DepartmentsResponse {
    departments: Department[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetDepartmentsParams {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const departmentService = {
    async getDepartments(params: GetDepartmentsParams = {}): Promise<DepartmentsResponse> {
        const response = await api.get<ApiResponse<Department[]>>('/departments', { params });
        if (response.data.success && response.data.data) {
            return {
                departments: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get departments');
    },

    async getDepartment(id: string): Promise<Department> {
        const response = await api.get<ApiResponse<Department>>(`/departments/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get department');
    },

    async createDepartment(data: CreateDepartmentRequest): Promise<Department> {
        const response = await api.post<ApiResponse<Department>>('/departments', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create department');
    },

    async updateDepartment(id: string, data: Partial<CreateDepartmentRequest>): Promise<Department> {
        const response = await api.put<ApiResponse<Department>>(`/departments/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update department');
    },

    async deleteDepartment(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/departments/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete department');
        }
    },
};

export default departmentService;
