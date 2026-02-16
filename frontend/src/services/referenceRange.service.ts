import api from './api';
import type { 
  ReferenceRange, 
  CreateReferenceRangeRequest, 
  UpdateReferenceRangeRequest,
  ApiResponse
} from '../types';

export interface ReferenceRangesResponse {
  ranges: ReferenceRange[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetReferenceRangesParams {
  page?: number;
  limit?: number;
  testId?: string;
  gender?: string;
  search?: string;
}

export const referenceRangeService = {
  async getReferenceRanges(params: GetReferenceRangesParams = {}): Promise<ReferenceRangesResponse> {
    const response = await api.get<ApiResponse<ReferenceRange[]>>('/reference-ranges', { params });
    if (response.data.success && response.data.data) {
      return {
        ranges: response.data.data,
        pagination: response.data.pagination!,
      };
    }
    throw new Error(response.data.error || 'Failed to get reference ranges');
  },

  async getReferenceRange(id: string): Promise<ReferenceRange> {
    const response = await api.get<ApiResponse<ReferenceRange>>(`/reference-ranges/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get reference range');
  },

  async getRangesByTestId(testId: string): Promise<ReferenceRange[]> {
    const response = await api.get<ApiResponse<ReferenceRange[]>>(`/reference-ranges/test/${testId}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get ranges by test ID');
  },

  async createReferenceRange(data: CreateReferenceRangeRequest): Promise<ReferenceRange> {
    const response = await api.post<ApiResponse<ReferenceRange>>('/reference-ranges', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to create reference range');
  },

  async updateReferenceRange(id: string, data: UpdateReferenceRangeRequest): Promise<ReferenceRange> {
    const response = await api.patch<ApiResponse<ReferenceRange>>(`/reference-ranges/${id}`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to update reference range');
  },

  async deleteReferenceRange(id: string): Promise<void> {
    const response = await api.delete<ApiResponse<void>>(`/reference-ranges/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete reference range');
    }
  },
};
