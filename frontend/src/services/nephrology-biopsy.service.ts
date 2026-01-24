import api from './api';
import type {
    ApiResponse,
    CreateNephrologyBiopsyRequest,
    NephrologyBiopsy,
    NephrologyProcedureStatus,
} from '../types';

export interface NephrologyBiopsyResponse {
    biopsies: NephrologyBiopsy[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetNephrologyBiopsyParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: NephrologyProcedureStatus;
    patientId?: string;
    providerId?: string;
    visitId?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const nephrologyBiopsyService = {
    async getBiopsies(params: GetNephrologyBiopsyParams = {}): Promise<NephrologyBiopsyResponse> {
        const response = await api.get<ApiResponse<NephrologyBiopsy[]>>('/nephrology-biopsies', { params });
        if (response.data.success && response.data.data) {
            return {
                biopsies: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get nephrology biopsies');
    },

    async getBiopsy(id: string): Promise<NephrologyBiopsy> {
        const response = await api.get<ApiResponse<NephrologyBiopsy>>(`/nephrology-biopsies/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get nephrology biopsy');
    },

    async createBiopsy(data: CreateNephrologyBiopsyRequest): Promise<NephrologyBiopsy> {
        const response = await api.post<ApiResponse<NephrologyBiopsy>>('/nephrology-biopsies', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create nephrology biopsy');
    },

    async updateBiopsy(id: string, data: Partial<CreateNephrologyBiopsyRequest>): Promise<NephrologyBiopsy> {
        const response = await api.put<ApiResponse<NephrologyBiopsy>>(`/nephrology-biopsies/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update nephrology biopsy');
    },

    async deleteBiopsy(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/nephrology-biopsies/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete nephrology biopsy');
        }
    },
};

export default nephrologyBiopsyService;
