import api from './api';
import type { 
  IcuAdmission, 
  CreateIcuAdmissionRequest, 
  UpdateIcuAdmissionRequest,
  ApiResponse,
  IcuAdmissionStatus,
  IcuAdmissionSource
} from '../types';

export interface IcuAdmissionsResponse {
  admissions: IcuAdmission[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetIcuAdmissionsParams {
  page?: number;
  limit?: number;
  patientId?: string;
  status?: IcuAdmissionStatus;
  admissionSource?: IcuAdmissionSource;
  admittingProviderId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface IcuAdmissionStats {
  byStatus: { status: IcuAdmissionStatus; _count: { id: number } }[];
  today: number;
  active: number;
  ventilated: number;
}

export const icuAdmissionService = {
  async getIcuAdmissions(params: GetIcuAdmissionsParams = {}): Promise<IcuAdmissionsResponse> {
    const response = await api.get<ApiResponse<IcuAdmission[]>>('/icu-admissions', { params });
    if (response.data.success && response.data.data) {
      return {
        admissions: response.data.data,
        pagination: response.data.pagination!,
      };
    }
    throw new Error(response.data.error || 'Failed to get ICU admissions');
  },

  async getIcuAdmission(id: string): Promise<IcuAdmission> {
    const response = await api.get<ApiResponse<IcuAdmission>>(`/icu-admissions/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get ICU admission');
  },

  async createIcuAdmission(data: CreateIcuAdmissionRequest): Promise<IcuAdmission> {
    const response = await api.post<ApiResponse<IcuAdmission>>('/icu-admissions', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to create ICU admission');
  },

  async updateIcuAdmission(id: string, data: UpdateIcuAdmissionRequest): Promise<IcuAdmission> {
    const response = await api.patch<ApiResponse<IcuAdmission>>(`/icu-admissions/${id}`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to update ICU admission');
  },

  async getActiveAdmissions(): Promise<IcuAdmission[]> {
    const response = await api.get<ApiResponse<IcuAdmission[]>>('/icu-admissions/active');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get active ICU admissions');
  },

  async getStats(): Promise<IcuAdmissionStats> {
    const response = await api.get<ApiResponse<IcuAdmissionStats>>('/icu-admissions/stats');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get ICU admission stats');
  },
};
