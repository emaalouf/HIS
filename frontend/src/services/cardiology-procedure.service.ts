import api from './api';
import type {
    ApiResponse,
    CardiologyProcedure,
    CardiologyProcedureStatus,
    CreateCardiologyProcedureRequest,
} from '../types';

export interface CardiologyProcedureResponse {
    procedures: CardiologyProcedure[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetCardiologyProcedureParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: CardiologyProcedureStatus;
    patientId?: string;
    providerId?: string;
    visitId?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const cardiologyProcedureService = {
    async getProcedures(params: GetCardiologyProcedureParams = {}): Promise<CardiologyProcedureResponse> {
        const response = await api.get<ApiResponse<CardiologyProcedure[]>>('/cardiology-procedures', { params });
        if (response.data.success && response.data.data) {
            return {
                procedures: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get cardiology procedures');
    },

    async getProcedure(id: string): Promise<CardiologyProcedure> {
        const response = await api.get<ApiResponse<CardiologyProcedure>>(`/cardiology-procedures/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get cardiology procedure');
    },

    async createProcedure(data: CreateCardiologyProcedureRequest): Promise<CardiologyProcedure> {
        const response = await api.post<ApiResponse<CardiologyProcedure>>('/cardiology-procedures', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create cardiology procedure');
    },

    async updateProcedure(id: string, data: Partial<CreateCardiologyProcedureRequest>): Promise<CardiologyProcedure> {
        const response = await api.put<ApiResponse<CardiologyProcedure>>(`/cardiology-procedures/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update cardiology procedure');
    },

    async deleteProcedure(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/cardiology-procedures/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete cardiology procedure');
        }
    },
};

export default cardiologyProcedureService;
