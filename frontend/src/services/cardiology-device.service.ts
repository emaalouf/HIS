import api from './api';
import type {
    ApiResponse,
    CardiologyDevice,
    CardiologyDeviceStatus,
    CreateCardiologyDeviceRequest,
} from '../types';

export interface CardiologyDeviceResponse {
    devices: CardiologyDevice[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetCardiologyDeviceParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: CardiologyDeviceStatus;
    patientId?: string;
    providerId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const cardiologyDeviceService = {
    async getDevices(params: GetCardiologyDeviceParams = {}): Promise<CardiologyDeviceResponse> {
        const response = await api.get<ApiResponse<CardiologyDevice[]>>('/cardiology-devices', { params });
        if (response.data.success && response.data.data) {
            return {
                devices: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get cardiology devices');
    },

    async getDevice(id: string): Promise<CardiologyDevice> {
        const response = await api.get<ApiResponse<CardiologyDevice>>(`/cardiology-devices/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get cardiology device');
    },

    async createDevice(data: CreateCardiologyDeviceRequest): Promise<CardiologyDevice> {
        const response = await api.post<ApiResponse<CardiologyDevice>>('/cardiology-devices', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create cardiology device');
    },

    async updateDevice(id: string, data: Partial<CreateCardiologyDeviceRequest>): Promise<CardiologyDevice> {
        const response = await api.put<ApiResponse<CardiologyDevice>>(`/cardiology-devices/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update cardiology device');
    },

    async deleteDevice(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/cardiology-devices/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete cardiology device');
        }
    },
};

export default cardiologyDeviceService;
