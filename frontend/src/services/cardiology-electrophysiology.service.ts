import api from './api';
import type {
    ApiResponse,
    CardiologyTestStatus,
    CreateCardiologyElectrophysiologyRequest,
    ElectrophysiologyProcedureType,
} from '../types';

export interface CardiologyElectrophysiology {
    id: string;
    patientId: string;
    providerId: string | null;
    visitId: string | null;
    status: CardiologyTestStatus;
    performedAt: string;
    procedureType: ElectrophysiologyProcedureType;
    indication: string | null;
    arrhythmiaType: string | null;
    deviceType: string | null;
    manufacturer: string | null;
    model: string | null;
    serialNumber: string | null;
    implantDate: string | null;
    ablationTarget: string | null;
    fluoroscopyTime: number | null;
    complications: string | null;
    outcome: string | null;
    followUpDate: string | null;
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

export interface CardiologyElectrophysiologyResponse {
    studies: CardiologyElectrophysiology[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetCardiologyElectrophysiologyParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: CardiologyTestStatus;
    patientId?: string;
    providerId?: string;
    visitId?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const cardiologyElectrophysiologyService = {
    async getStudies(params: GetCardiologyElectrophysiologyParams = {}): Promise<CardiologyElectrophysiologyResponse> {
        const response = await api.get<ApiResponse<CardiologyElectrophysiology[]>>('/cardiology-electrophysiology', { params });
        if (response.data.success && response.data.data) {
            return {
                studies: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get cardiology electrophysiology studies');
    },

    async getStudy(id: string): Promise<CardiologyElectrophysiology> {
        const response = await api.get<ApiResponse<CardiologyElectrophysiology>>(`/cardiology-electrophysiology/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get cardiology electrophysiology study');
    },

    async createStudy(data: CreateCardiologyElectrophysiologyRequest): Promise<CardiologyElectrophysiology> {
        const response = await api.post<ApiResponse<CardiologyElectrophysiology>>('/cardiology-electrophysiology', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create cardiology electrophysiology study');
    },

    async updateStudy(id: string, data: Partial<CreateCardiologyElectrophysiologyRequest>): Promise<CardiologyElectrophysiology> {
        const response = await api.put<ApiResponse<CardiologyElectrophysiology>>(`/cardiology-electrophysiology/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update cardiology electrophysiology study');
    },

    async deleteStudy(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/cardiology-electrophysiology/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete cardiology electrophysiology study');
        }
    },
};

export default cardiologyElectrophysiologyService;
