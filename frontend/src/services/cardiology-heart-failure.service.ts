import api from './api';
import type {
    ApiResponse,
    CardiologyTestStatus,
    CreateCardiologyHeartFailureRequest,
    HeartFailureStage,
    NYHAClass,
} from '../types';

export interface CardiologyHeartFailure {
    id: string;
    patientId: string;
    providerId: string | null;
    visitId: string | null;
    status: CardiologyTestStatus;
    assessmentDate: string;
    etiology: string | null;
    nyhaClass: NYHAClass | null;
    heartFailureStage: HeartFailureStage | null;
    lvef: number | null;
    symptoms: string | null;
    medications: string | null;
    mechanicalSupport: string | null;
    transplantStatus: string | null;
    implantableDevices: string | null;
    rehospitalizations: number | null;
    lastHospitalization: string | null;
    bnp: number | null;
    ntProBnp: number | null;
    assessment: string | null;
    plan: string | null;
    nextFollowUpDate: string | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    patient?: {
        id: string;
        mrn: string;
        firstName: string;
        lastName: string;
    };
    provider?: {
        id: string;
        firstName: string;
        lastName: string;
        role: string;
    };
    visit?: {
        id: string;
        visitDate: string;
    };
}

export interface CardiologyHeartFailureResponse {
    assessments: CardiologyHeartFailure[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetCardiologyHeartFailureParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: CardiologyTestStatus;
    patientId?: string;
    providerId?: string;
    visitId?: string;
    startDate?: string;
    endDate?: string;
    nyhaClass?: string;
    heartFailureStage?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const cardiologyHeartFailureService = {
    async getAssessments(params: GetCardiologyHeartFailureParams = {}): Promise<CardiologyHeartFailureResponse> {
        const response = await api.get<ApiResponse<CardiologyHeartFailure[]>>('/cardiology-heart-failure', { params });
        if (response.data.success && response.data.data) {
            return {
                assessments: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get cardiology heart failure assessments');
    },

    async getAssessment(id: string): Promise<CardiologyHeartFailure> {
        const response = await api.get<ApiResponse<CardiologyHeartFailure>>(`/cardiology-heart-failure/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get cardiology heart failure assessment');
    },

    async createAssessment(data: CreateCardiologyHeartFailureRequest): Promise<CardiologyHeartFailure> {
        const response = await api.post<ApiResponse<CardiologyHeartFailure>>('/cardiology-heart-failure', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create cardiology heart failure assessment');
    },

    async updateAssessment(id: string, data: Partial<CreateCardiologyHeartFailureRequest>): Promise<CardiologyHeartFailure> {
        const response = await api.put<ApiResponse<CardiologyHeartFailure>>(`/cardiology-heart-failure/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update cardiology heart failure assessment');
    },

    async deleteAssessment(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/cardiology-heart-failure/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete cardiology heart failure assessment');
        }
    },
};

export default cardiologyHeartFailureService;
