import api from './api';
import type { 
  LabTest, 
  CreateLabTestRequest, 
  UpdateLabTestRequest,
  ApiResponse,
  LabTestCategory,
  SpecimenType
} from '../types';

export interface LabTestsResponse {
  tests: LabTest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetLabTestsParams {
  page?: number;
  limit?: number;
  category?: LabTestCategory;
  specimenType?: SpecimenType;
  isActive?: boolean;
  search?: string;
}

export const labTestService = {
  async getLabTests(params: GetLabTestsParams = {}): Promise<LabTestsResponse> {
    const response = await api.get<ApiResponse<LabTest[]>>('/lab-tests', { params });
    if (response.data.success && response.data.data) {
      return {
        tests: response.data.data,
        pagination: response.data.pagination!,
      };
    }
    throw new Error(response.data.error || 'Failed to get lab tests');
  },

  async getLabTest(id: string): Promise<LabTest> {
    const response = await api.get<ApiResponse<LabTest>>(`/lab-tests/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get lab test');
  },

  async createLabTest(data: CreateLabTestRequest): Promise<LabTest> {
    const response = await api.post<ApiResponse<LabTest>>('/lab-tests', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to create lab test');
  },

  async updateLabTest(id: string, data: UpdateLabTestRequest): Promise<LabTest> {
    const response = await api.patch<ApiResponse<LabTest>>(`/lab-tests/${id}`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to update lab test');
  },

  async deleteLabTest(id: string): Promise<void> {
    const response = await api.delete<ApiResponse<void>>(`/lab-tests/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete lab test');
    }
  },

  async getTestsByCategory(category: LabTestCategory): Promise<LabTest[]> {
    const response = await api.get<ApiResponse<LabTest[]>>(`/lab-tests/category/${category}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get tests by category');
  },

  async getCategories(): Promise<LabTestCategory[]> {
    const response = await api.get<ApiResponse<LabTestCategory[]>>('/lab-tests/categories');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get categories');
  },
};
