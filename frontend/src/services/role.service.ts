import api from './api';
import type { ApiResponse, AccessRole, CreateRoleRequest } from '../types';

export interface RolesResponse {
    roles: AccessRole[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetRolesParams {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const roleService = {
    async getRoles(params: GetRolesParams = {}): Promise<RolesResponse> {
        const response = await api.get<ApiResponse<AccessRole[]>>('/roles', { params });
        if (response.data.success && response.data.data) {
            return {
                roles: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get roles');
    },

    async getRole(id: string): Promise<AccessRole> {
        const response = await api.get<ApiResponse<AccessRole>>(`/roles/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get role');
    },

    async createRole(data: CreateRoleRequest): Promise<AccessRole> {
        const response = await api.post<ApiResponse<AccessRole>>('/roles', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create role');
    },

    async updateRole(id: string, data: Partial<CreateRoleRequest>): Promise<AccessRole> {
        const response = await api.put<ApiResponse<AccessRole>>(`/roles/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update role');
    },

    async deleteRole(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/roles/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete role');
        }
    },
};

export default roleService;
