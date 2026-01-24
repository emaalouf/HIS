import api from './api';
import type {
    ApiResponse,
    CardiologyStressTest,
    CardiologyTestStatus,
    CreateCardiologyStressTestRequest,
} from '../types';

export interface CardiologyStressTestResponse {
    stressTests: CardiologyStressTest[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetCardiologyStressTestParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: CardiologyTestStatus;
    patientId?: string;
    providerId?: string;
    visitId?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const cardiologyStressTestService = {
    async getStressTests(params: GetCardiologyStressTestParams = {}): Promise<CardiologyStressTestResponse> {
        const response = await api.get<ApiResponse<CardiologyStressTest[]>>('/cardiology-stress-tests', { params });
        if (response.data.success && response.data.data) {
            return {
                stressTests: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get cardiology stress tests');
    },

    async getStressTest(id: string): Promise<CardiologyStressTest> {
        const response = await api.get<ApiResponse<CardiologyStressTest>>(`/cardiology-stress-tests/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get cardiology stress test');
    },

    async createStressTest(data: CreateCardiologyStressTestRequest): Promise<CardiologyStressTest> {
        const response = await api.post<ApiResponse<CardiologyStressTest>>('/cardiology-stress-tests', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create cardiology stress test');
    },

    async updateStressTest(id: string, data: Partial<CreateCardiologyStressTestRequest>): Promise<CardiologyStressTest> {
        const response = await api.put<ApiResponse<CardiologyStressTest>>(`/cardiology-stress-tests/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update cardiology stress test');
    },

    async deleteStressTest(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/cardiology-stress-tests/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete cardiology stress test');
        }
    },
};

export default cardiologyStressTestService;
