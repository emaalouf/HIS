import api from './api';
import type { 
  QCControl, 
  QCResult,
  CreateQCControlRequest, 
  UpdateQCControlRequest,
  CreateQCResultRequest,
  ReviewQCResultRequest,
  ApiResponse
} from '../types';

export interface QCControlsResponse {
  controls: QCControl[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface QCResultsResponse {
  results: QCResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetQCControlsParams {
  page?: number;
  limit?: number;
  testId?: string;
  isActive?: boolean;
  expiringBefore?: string;
}

export interface GetQCResultsParams {
  page?: number;
  limit?: number;
  controlId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface QCStats {
  byStatus: { status: string; _count: { id: number } }[];
  today: number;
  expiringControls: number;
  recentFailures: number;
}

export interface LeveyJenningsData {
  control: QCControl;
  mean: number;
  sd: number;
  results: {
    date: string;
    value: number;
    deviation: number;
    status: string;
  }[];
  limits: {
    target: number;
    plus1SD: number;
    minus1SD: number;
    plus2SD: number;
    minus2SD: number;
    plus3SD: number;
    minus3SD: number;
  };
}

export const qcControlService = {
  // QC Controls
  async getQCControls(params: GetQCControlsParams = {}): Promise<QCControlsResponse> {
    const response = await api.get<ApiResponse<QCControl[]>>('/qc-controls', { params });
    if (response.data.success && response.data.data) {
      return {
        controls: response.data.data,
        pagination: response.data.pagination!,
      };
    }
    throw new Error(response.data.error || 'Failed to get QC controls');
  },

  async getQCControl(id: string): Promise<QCControl> {
    const response = await api.get<ApiResponse<QCControl>>(`/qc-controls/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get QC control');
  },

  async createQCControl(data: CreateQCControlRequest): Promise<QCControl> {
    const response = await api.post<ApiResponse<QCControl>>('/qc-controls', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to create QC control');
  },

  async updateQCControl(id: string, data: UpdateQCControlRequest): Promise<QCControl> {
    const response = await api.patch<ApiResponse<QCControl>>(`/qc-controls/${id}`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to update QC control');
  },

  async deactivateQCControl(id: string): Promise<void> {
    const response = await api.delete<ApiResponse<void>>(`/qc-controls/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to deactivate QC control');
    }
  },

  // QC Results
  async getQCResults(params: GetQCResultsParams = {}): Promise<QCResultsResponse> {
    const response = await api.get<ApiResponse<QCResult[]>>('/qc-controls/results/list', { params });
    if (response.data.success && response.data.data) {
      return {
        results: response.data.data,
        pagination: response.data.pagination!,
      };
    }
    throw new Error(response.data.error || 'Failed to get QC results');
  },

  async createQCResult(data: CreateQCResultRequest): Promise<QCResult> {
    const response = await api.post<ApiResponse<QCResult>>('/qc-controls/results', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to create QC result');
  },

  async reviewQCResult(resultId: string, data: ReviewQCResultRequest): Promise<QCResult> {
    const response = await api.post<ApiResponse<QCResult>>(`/qc-controls/results/${resultId}/review`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to review QC result');
  },

  // Stats and Charts
  async getLeveyJenningsData(controlId: string, days: number = 30): Promise<LeveyJenningsData> {
    const response = await api.get<ApiResponse<LeveyJenningsData>>(
      `/qc-controls/${controlId}/levey-jennings`,
      { params: { days } }
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get Levey-Jennings data');
  },

  async getStats(): Promise<QCStats> {
    const response = await api.get<ApiResponse<QCStats>>('/qc-controls/stats');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get QC stats');
  },
};
