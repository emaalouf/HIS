import api from './api';
import type { ApiResponse, NeurologyCognitiveAssessment, CreateNeurologyCognitiveRequest } from '../types';

export interface NeurologyCognitiveAssessmentsResponse {
    assessments: NeurologyCognitiveAssessment[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetNeurologyCognitiveParams {
    page?: number;
    limit?: number;
    search?: string;
    patientId?: string;
    providerId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const neurologyCognitiveService = {
    async getAssessments(params: GetNeurologyCognitiveParams = {}): Promise<NeurologyCognitiveAssessmentsResponse> {
        const response = await api.get<ApiResponse<NeurologyCognitiveAssessment[]>>('/neurology-cognitive', { params });
        if (response.data.success && response.data.data) {
            return {
                assessments: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get cognitive assessments');
    },

    async getAssessment(id: string): Promise<NeurologyCognitiveAssessment> {
        const response = await api.get<ApiResponse<NeurologyCognitiveAssessment>>(`/neurology-cognitive/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get cognitive assessment');
    },

    async createAssessment(data: CreateNeurologyCognitiveRequest): Promise<NeurologyCognitiveAssessment> {
        const response = await api.post<ApiResponse<NeurologyCognitiveAssessment>>('/neurology-cognitive', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create cognitive assessment');
    },

    async updateAssessment(id: string, data: Partial<CreateNeurologyCognitiveRequest>): Promise<NeurologyCognitiveAssessment> {
        const response = await api.put<ApiResponse<NeurologyCognitiveAssessment>>(`/neurology-cognitive/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update cognitive assessment');
    },

    async deleteAssessment(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/neurology-cognitive/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete cognitive assessment');
        }
    },
};

export default neurologyCognitiveService;
