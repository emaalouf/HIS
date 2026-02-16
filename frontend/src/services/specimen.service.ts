import api from './api';
import type { 
  Specimen, 
  CreateSpecimenRequest, 
  ReceiveSpecimenRequest,
  ApiResponse,
  SpecimenType,
  SpecimenStatus
} from '../types';

export interface SpecimensResponse {
  specimens: Specimen[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetSpecimensParams {
  page?: number;
  limit?: number;
  patientId?: string;
  status?: SpecimenStatus;
  specimenType?: SpecimenType;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface SpecimenStats {
  byStatus: { status: SpecimenStatus; _count: { id: number } }[];
  today: number;
}

export const specimenService = {
  async getSpecimens(params: GetSpecimensParams = {}): Promise<SpecimensResponse> {
    const response = await api.get<ApiResponse<Specimen[]>>('/specimens', { params });
    if (response.data.success && response.data.data) {
      return {
        specimens: response.data.data,
        pagination: response.data.pagination!,
      };
    }
    throw new Error(response.data.error || 'Failed to get specimens');
  },

  async getSpecimen(id: string): Promise<Specimen> {
    const response = await api.get<ApiResponse<Specimen>>(`/specimens/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get specimen');
  },

  async getSpecimenByBarcode(barcode: string): Promise<Specimen> {
    const response = await api.get<ApiResponse<Specimen>>(`/specimens/barcode/${barcode}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get specimen by barcode');
  },

  async createSpecimen(data: CreateSpecimenRequest): Promise<Specimen> {
    const response = await api.post<ApiResponse<Specimen>>('/specimens', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to create specimen');
  },

  async receiveSpecimen(id: string, data: ReceiveSpecimenRequest): Promise<Specimen> {
    const response = await api.post<ApiResponse<Specimen>>(`/specimens/${id}/receive`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to receive specimen');
  },

  async rejectSpecimen(id: string, reason: string): Promise<Specimen> {
    const response = await api.post<ApiResponse<Specimen>>(`/specimens/${id}/reject`, { reason });
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to reject specimen');
  },

  async getStats(): Promise<SpecimenStats> {
    const response = await api.get<ApiResponse<SpecimenStats>>('/specimens/stats');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get specimen stats');
  },
};
