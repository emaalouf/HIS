import api from './api';
import type { 
  TestPanel, 
  CreateTestPanelRequest, 
  UpdateTestPanelRequest,
  ApiResponse
} from '../types';

export interface TestPanelsResponse {
  panels: TestPanel[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetTestPanelsParams {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
}

export const testPanelService = {
  async getTestPanels(params: GetTestPanelsParams = {}): Promise<TestPanelsResponse> {
    const response = await api.get<ApiResponse<TestPanel[]>>('/test-panels', { params });
    if (response.data.success && response.data.data) {
      return {
        panels: response.data.data,
        pagination: response.data.pagination!,
      };
    }
    throw new Error(response.data.error || 'Failed to get test panels');
  },

  async getTestPanel(id: string): Promise<TestPanel> {
    const response = await api.get<ApiResponse<TestPanel>>(`/test-panels/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get test panel');
  },

  async createTestPanel(data: CreateTestPanelRequest): Promise<TestPanel> {
    const response = await api.post<ApiResponse<TestPanel>>('/test-panels', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to create test panel');
  },

  async updateTestPanel(id: string, data: UpdateTestPanelRequest): Promise<TestPanel> {
    const response = await api.patch<ApiResponse<TestPanel>>(`/test-panels/${id}`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to update test panel');
  },

  async deleteTestPanel(id: string): Promise<void> {
    const response = await api.delete<ApiResponse<void>>(`/test-panels/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete test panel');
    }
  },
};
