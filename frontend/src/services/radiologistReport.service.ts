import api from './api';
import type { 
  RadiologistReport, 
  CreateRadiologistReportRequest, 
  UpdateRadiologistReportRequest,
  ApiResponse,
  RadiologistReportStatus
} from '../types';

export interface RadiologistReportsResponse {
  reports: RadiologistReport[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetRadiologistReportsParams {
  page?: number;
  limit?: number;
  studyId?: string;
  radiologistId?: string;
  status?: RadiologistReportStatus;
  criticalOnly?: boolean;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface RadiologistReportStats {
  byStatus: { status: RadiologistReportStatus; _count: { id: number } }[];
  today: number;
  critical: number;
}

export const radiologistReportService = {
  async getReports(params: GetRadiologistReportsParams = {}): Promise<RadiologistReportsResponse> {
    const response = await api.get<ApiResponse<RadiologistReport[]>>('/radiologist-reports', { params });
    if (response.data.success && response.data.data) {
      return {
        reports: response.data.data,
        pagination: response.data.pagination!,
      };
    }
    throw new Error(response.data.error || 'Failed to get radiologist reports');
  },

  async getReport(id: string): Promise<RadiologistReport> {
    const response = await api.get<ApiResponse<RadiologistReport>>(`/radiologist-reports/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get radiologist report');
  },

  async createReport(data: CreateRadiologistReportRequest): Promise<RadiologistReport> {
    const response = await api.post<ApiResponse<RadiologistReport>>('/radiologist-reports', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to create radiologist report');
  },

  async updateReport(id: string, data: UpdateRadiologistReportRequest): Promise<RadiologistReport> {
    const response = await api.patch<ApiResponse<RadiologistReport>>(`/radiologist-reports/${id}`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to update radiologist report');
  },

  async submitReport(id: string): Promise<RadiologistReport> {
    const response = await api.post<ApiResponse<RadiologistReport>>(`/radiologist-reports/${id}/submit`, {});
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to submit radiologist report');
  },

  async verifyReport(id: string): Promise<RadiologistReport> {
    const response = await api.post<ApiResponse<RadiologistReport>>(`/radiologist-reports/${id}/verify`, {});
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to verify radiologist report');
  },

  async getCriticalReports(): Promise<RadiologistReport[]> {
    const response = await api.get<ApiResponse<RadiologistReport[]>>('/radiologist-reports/critical');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get critical reports');
  },

  async markNotificationSent(id: string): Promise<RadiologistReport> {
    const response = await api.post<ApiResponse<RadiologistReport>>(`/radiologist-reports/${id}/notify`, {});
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to mark notification sent');
  },

  async getStats(): Promise<RadiologistReportStats> {
    const response = await api.get<ApiResponse<RadiologistReportStats>>('/radiologist-reports/stats');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get radiologist report stats');
  },
};
