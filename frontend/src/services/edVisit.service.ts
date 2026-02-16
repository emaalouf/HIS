import api from './api';
import type { 
  EDVisit, 
  CreateEDVisitRequest, 
  UpdateEDVisitRequest,
  ApiResponse,
  EDVisitStatus,
  ESI
} from '../types';

export interface EDVisitsResponse {
  visits: EDVisit[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetEDVisitsParams {
  page?: number;
  limit?: number;
  patientId?: string;
  status?: EDVisitStatus;
  triageLevel?: ESI;
  assignedProviderId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface EDVisitStats {
  byStatus: { status: EDVisitStatus; _count: { id: number } }[];
  today: number;
  active: number;
  critical: number;
}

export const edVisitService = {
  async getEDVisits(params: GetEDVisitsParams = {}): Promise<EDVisitsResponse> {
    const response = await api.get<ApiResponse<EDVisit[]>>('/ed-visits', { params });
    if (response.data.success && response.data.data) {
      return {
        visits: response.data.data,
        pagination: response.data.pagination!,
      };
    }
    throw new Error(response.data.error || 'Failed to get ED visits');
  },

  async getEDVisit(id: string): Promise<EDVisit> {
    const response = await api.get<ApiResponse<EDVisit>>(`/ed-visits/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get ED visit');
  },

  async createEDVisit(data: CreateEDVisitRequest): Promise<EDVisit> {
    const response = await api.post<ApiResponse<EDVisit>>('/ed-visits', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to create ED visit');
  },

  async updateEDVisit(id: string, data: UpdateEDVisitRequest): Promise<EDVisit> {
    const response = await api.patch<ApiResponse<EDVisit>>(`/ed-visits/${id}`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to update ED visit');
  },

  async getActiveVisits(): Promise<EDVisit[]> {
    const response = await api.get<ApiResponse<EDVisit[]>>('/ed-visits/active');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get active ED visits');
  },

  async getStats(): Promise<EDVisitStats> {
    const response = await api.get<ApiResponse<EDVisitStats>>('/ed-visits/stats');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get ED visit stats');
  },
};
