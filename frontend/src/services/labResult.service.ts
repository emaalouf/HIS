import api from './api';
import type { 
  LabResult, 
  CreateLabResultRequest, 
  UpdateLabResultRequest,
  ReviewLabResultRequest,
  ApiResponse,
  LabResultStatus,
  LabResultFlag
} from '../types';

export interface LabResultsResponse {
  results: LabResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetLabResultsParams {
  page?: number;
  limit?: number;
  patientId?: string;
  workOrderId?: string;
  testId?: string;
  status?: LabResultStatus;
  flag?: LabResultFlag;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface LabResultStats {
  byStatusAndFlag: { status: LabResultStatus; flag: LabResultFlag; _count: { id: number } }[];
  today: number;
  critical: number;
}

export const labResultService = {
  async getResults(params: GetLabResultsParams = {}): Promise<LabResultsResponse> {
    const response = await api.get<ApiResponse<LabResult[]>>('/lab-results', { params });
    if (response.data.success && response.data.data) {
      return {
        results: response.data.data,
        pagination: response.data.pagination!,
      };
    }
    throw new Error(response.data.error || 'Failed to get lab results');
  },

  async getResult(id: string): Promise<LabResult> {
    const response = await api.get<ApiResponse<LabResult>>(`/lab-results/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get lab result');
  },

  async getPatientResults(
    patientId: string, 
    params: { testId?: string; dateFrom?: string; dateTo?: string; page?: number; limit?: number } = {}
  ): Promise<LabResultsResponse> {
    const response = await api.get<ApiResponse<LabResult[]>>(`/lab-results/patient/${patientId}`, { params });
    if (response.data.success && response.data.data) {
      return {
        results: response.data.data,
        pagination: response.data.pagination!,
      };
    }
    throw new Error(response.data.error || 'Failed to get patient results');
  },

  async createResult(data: CreateLabResultRequest): Promise<LabResult> {
    const response = await api.post<ApiResponse<LabResult>>('/lab-results', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to create lab result');
  },

  async updateResult(id: string, data: UpdateLabResultRequest): Promise<LabResult> {
    const response = await api.patch<ApiResponse<LabResult>>(`/lab-results/${id}`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to update lab result');
  },

  async finalizeResult(id: string): Promise<LabResult> {
    const response = await api.post<ApiResponse<LabResult>>(`/lab-results/${id}/finalize`, {});
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to finalize lab result');
  },

  async reviewResult(id: string, data: ReviewLabResultRequest): Promise<LabResult> {
    const response = await api.post<ApiResponse<LabResult>>(`/lab-results/${id}/review`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to review lab result');
  },

  async getCriticalResults(): Promise<LabResult[]> {
    const response = await api.get<ApiResponse<LabResult[]>>('/lab-results/critical');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get critical results');
  },

  async getStats(): Promise<LabResultStats> {
    const response = await api.get<ApiResponse<LabResultStats>>('/lab-results/stats');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get lab result stats');
  },
};
