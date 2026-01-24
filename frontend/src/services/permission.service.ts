import api from './api';
import type { ApiResponse, Permission, CreatePermissionRequest } from '../types';

export interface PermissionsResponse {
    permissions: Permission[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetPermissionsParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const permissionService = {
    async getPermissions(params: GetPermissionsParams = {}): Promise<PermissionsResponse> {
        const response = await api.get<ApiResponse<Permission[]>>('/permissions', { params });
        if (response.data.success && response.data.data) {
            return {
                permissions: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get permissions');
    },

    async getPermission(id: string): Promise<Permission> {
        const response = await api.get<ApiResponse<Permission>>(`/permissions/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get permission');
    },

    async createPermission(data: CreatePermissionRequest): Promise<Permission> {
        const response = await api.post<ApiResponse<Permission>>('/permissions', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create permission');
    },

    async updatePermission(id: string, data: Partial<CreatePermissionRequest>): Promise<Permission> {
        const response = await api.put<ApiResponse<Permission>>(`/permissions/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update permission');
    },

    async deletePermission(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/permissions/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete permission');
        }
    },
};

export default permissionService;
