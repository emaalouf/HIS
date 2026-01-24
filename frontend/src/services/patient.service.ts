import api from './api';
import type {
    ApiResponse,
    Patient,
    PatientStats,
    CreatePatientRequest,
    MedicalHistory,
    CreateMedicalHistoryRequest,
} from '../types';

export interface PatientsResponse {
    patients: Patient[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetPatientsParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    isActive?: boolean;
}

export const patientService = {
    async getStats(): Promise<PatientStats> {
        const response = await api.get<ApiResponse<PatientStats>>('/patients/stats');
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get stats');
    },

    async getPatients(params: GetPatientsParams = {}): Promise<PatientsResponse> {
        const response = await api.get<ApiResponse<Patient[]>>('/patients', { params });
        if (response.data.success && response.data.data) {
            return {
                patients: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get patients');
    },

    async getPatient(id: string): Promise<Patient> {
        const response = await api.get<ApiResponse<Patient>>(`/patients/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get patient');
    },

    async createPatient(data: CreatePatientRequest): Promise<Patient> {
        const response = await api.post<ApiResponse<Patient>>('/patients', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create patient');
    },

    async updatePatient(id: string, data: Partial<CreatePatientRequest>): Promise<Patient> {
        const response = await api.put<ApiResponse<Patient>>(`/patients/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update patient');
    },

    async deletePatient(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/patients/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete patient');
        }
    },

    async getMedicalHistory(patientId: string): Promise<MedicalHistory[]> {
        const response = await api.get<ApiResponse<MedicalHistory[]>>(`/patients/${patientId}/history`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get medical history');
    },

    async addMedicalHistory(patientId: string, data: CreateMedicalHistoryRequest): Promise<MedicalHistory> {
        const response = await api.post<ApiResponse<MedicalHistory>>(`/patients/${patientId}/history`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to add medical history');
    },
};

export default patientService;
