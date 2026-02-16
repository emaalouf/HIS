import api from './api';
import type { 
  ImagingStudy, 
  CreateImagingStudyRequest, 
  UpdateImagingStudyRequest,
  ApiResponse,
  ImagingModality,
  ImagingStudyStatus,
  OrderPriority
} from '../types';

export interface ImagingStudiesResponse {
  studies: ImagingStudy[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetImagingStudiesParams {
  page?: number;
  limit?: number;
  patientId?: string;
  status?: ImagingStudyStatus;
  modality?: ImagingModality;
  priority?: OrderPriority;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ImagingStudyStats {
  byStatusAndModality: { status: ImagingStudyStatus; modality: ImagingModality; _count: { id: number } }[];
  today: number;
  pendingSTAT: number;
}

export const imagingStudyService = {
  async getImagingStudies(params: GetImagingStudiesParams = {}): Promise<ImagingStudiesResponse> {
    const response = await api.get<ApiResponse<ImagingStudy[]>>('/imaging-studies', { params });
    if (response.data.success && response.data.data) {
      return {
        studies: response.data.data,
        pagination: response.data.pagination!,
      };
    }
    throw new Error(response.data.error || 'Failed to get imaging studies');
  },

  async getImagingStudy(id: string): Promise<ImagingStudy> {
    const response = await api.get<ApiResponse<ImagingStudy>>(`/imaging-studies/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get imaging study');
  },

  async getImagingStudyByAccessionNumber(accessionNumber: string): Promise<ImagingStudy> {
    const response = await api.get<ApiResponse<ImagingStudy>>(`/imaging-studies/accession/${accessionNumber}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get imaging study by accession number');
  },

  async createImagingStudy(data: CreateImagingStudyRequest): Promise<ImagingStudy> {
    const response = await api.post<ApiResponse<ImagingStudy>>('/imaging-studies', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to create imaging study');
  },

  async updateImagingStudy(id: string, data: UpdateImagingStudyRequest): Promise<ImagingStudy> {
    const response = await api.patch<ApiResponse<ImagingStudy>>(`/imaging-studies/${id}`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to update imaging study');
  },

  async deleteImagingStudy(id: string): Promise<void> {
    const response = await api.delete<ApiResponse<void>>(`/imaging-studies/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete imaging study');
    }
  },

  async getPendingStudies(): Promise<ImagingStudy[]> {
    const response = await api.get<ApiResponse<ImagingStudy[]>>('/imaging-studies/pending');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get pending studies');
  },

  async getUnreportedStudies(): Promise<ImagingStudy[]> {
    const response = await api.get<ApiResponse<ImagingStudy[]>>('/imaging-studies/unreported');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get unreported studies');
  },

  async getStats(): Promise<ImagingStudyStats> {
    const response = await api.get<ApiResponse<ImagingStudyStats>>('/imaging-studies/stats');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get imaging study stats');
  },
};
