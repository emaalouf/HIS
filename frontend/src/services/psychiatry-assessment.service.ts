import api from './api';
import type { ApiResponse, PsychiatryAssessment, CreatePsychiatryAssessmentRequest } from '../types';

export interface PsychiatryAssessmentsResponse {
    assessments: PsychiatryAssessment[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetPsychiatryAssessmentsParams {
    page?: number;
    limit?: number;
    search?: string;
    patientId?: string;
    providerId?: string;
    assessmentType?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const psychiatryAssessmentService = {
    async getAssessments(params: GetPsychiatryAssessmentsParams = {}): Promise<PsychiatryAssessmentsResponse> {
        const response = await api.get<ApiResponse<PsychiatryAssessment[]>>('/psychiatry-assessments', { params });
        if (response.data.success && response.data.data) {
            return {
                assessments: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get assessments');
    },

    async getAssessment(id: string): Promise<PsychiatryAssessment> {
        const response = await api.get<ApiResponse<PsychiatryAssessment>>(`/psychiatry-assessments/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get assessment');
    },

    async createAssessment(data: CreatePsychiatryAssessmentRequest): Promise<PsychiatryAssessment> {
        const response = await api.post<ApiResponse<PsychiatryAssessment>>('/psychiatry-assessments', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create assessment');
    },

    async updateAssessment(id: string, data: Partial<CreatePsychiatryAssessmentRequest>): Promise<PsychiatryAssessment> {
        const response = await api.put<ApiResponse<PsychiatryAssessment>>(`/psychiatry-assessments/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update assessment');
    },

    async deleteAssessment(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/psychiatry-assessments/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete assessment');
        }
    },
};

export default psychiatryAssessmentService;
