import api from './api';
import type { ApiResponse, OncologyTumorBoard, CreateOncologyTumorBoardRequest } from '../types';

export interface OncologyTumorBoardsResponse {
    tumorBoards: OncologyTumorBoard[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetOncologyTumorBoardsParams {
    page?: number;
    limit?: number;
    search?: string;
    patientId?: string;
    presenterId?: string;
    status?: string;
    cancerType?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const oncologyTumorBoardService = {
    async getTumorBoards(params: GetOncologyTumorBoardsParams = {}): Promise<OncologyTumorBoardsResponse> {
        const response = await api.get<ApiResponse<OncologyTumorBoard[]>>('/oncology-tumor-boards', { params });
        if (response.data.success && response.data.data) {
            return {
                tumorBoards: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get tumor board records');
    },

    async getTumorBoard(id: string): Promise<OncologyTumorBoard> {
        const response = await api.get<ApiResponse<OncologyTumorBoard>>(`/oncology-tumor-boards/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get tumor board record');
    },

    async createTumorBoard(data: CreateOncologyTumorBoardRequest): Promise<OncologyTumorBoard> {
        const response = await api.post<ApiResponse<OncologyTumorBoard>>('/oncology-tumor-boards', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create tumor board record');
    },

    async updateTumorBoard(id: string, data: Partial<CreateOncologyTumorBoardRequest>): Promise<OncologyTumorBoard> {
        const response = await api.put<ApiResponse<OncologyTumorBoard>>(`/oncology-tumor-boards/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update tumor board record');
    },

    async deleteTumorBoard(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/oncology-tumor-boards/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete tumor board record');
        }
    },
};

export default oncologyTumorBoardService;
