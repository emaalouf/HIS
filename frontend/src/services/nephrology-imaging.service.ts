import api from './api';
import type {
    ApiResponse,
    CreateNephrologyImagingRequest,
    NephrologyImaging,
    NephrologyImagingModality,
    NephrologyTestStatus,
} from '../types';

export interface NephrologyImagingResponse {
    studies: NephrologyImaging[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetNephrologyImagingParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: NephrologyTestStatus;
    modality?: NephrologyImagingModality;
    patientId?: string;
    providerId?: string;
    visitId?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const nephrologyImagingService = {
    async getStudies(params: GetNephrologyImagingParams = {}): Promise<NephrologyImagingResponse> {
        const response = await api.get<ApiResponse<NephrologyImaging[]>>('/nephrology-imaging', { params });
        if (response.data.success && response.data.data) {
            return {
                studies: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get nephrology imaging');
    },

    async getStudy(id: string): Promise<NephrologyImaging> {
        const response = await api.get<ApiResponse<NephrologyImaging>>(`/nephrology-imaging/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get nephrology imaging');
    },

    async createStudy(data: CreateNephrologyImagingRequest): Promise<NephrologyImaging> {
        const response = await api.post<ApiResponse<NephrologyImaging>>('/nephrology-imaging', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create nephrology imaging');
    },

    async updateStudy(id: string, data: Partial<CreateNephrologyImagingRequest>): Promise<NephrologyImaging> {
        const response = await api.put<ApiResponse<NephrologyImaging>>(`/nephrology-imaging/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update nephrology imaging');
    },

    async deleteStudy(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/nephrology-imaging/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete nephrology imaging');
        }
    },
};

export default nephrologyImagingService;
