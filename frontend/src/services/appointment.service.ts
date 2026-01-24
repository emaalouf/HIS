import api from './api';
import type {
    ApiResponse,
    Appointment,
    AppointmentMeta,
    AppointmentStatus,
} from '../types';

export interface GetAppointmentsParams {
    page?: number;
    limit?: number;
    providerId?: string;
    patientId?: string;
    status?: AppointmentStatus;
    startDate?: string;
    endDate?: string;
    search?: string;
}

export interface AppointmentPayload {
    patientId: string;
    providerId: string;
    visitTypeId?: string | null;
    locationId?: string | null;
    startTime: string;
    endTime: string;
    reason?: string | null;
    notes?: string | null;
}

export const appointmentService = {
    async getAppointments(params: GetAppointmentsParams = {}): Promise<{ appointments: Appointment[]; pagination: NonNullable<ApiResponse['pagination']>; }> {
        const response = await api.get<ApiResponse<Appointment[]>>('/appointments', { params });
        if (response.data.success && response.data.data && response.data.pagination) {
            return {
                appointments: response.data.data,
                pagination: response.data.pagination,
            };
        }
        throw new Error(response.data.error || 'Failed to fetch appointments');
    },

    async getAppointment(id: string): Promise<Appointment> {
        const response = await api.get<ApiResponse<Appointment>>(`/appointments/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to fetch appointment');
    },

    async createAppointment(payload: AppointmentPayload): Promise<Appointment> {
        const response = await api.post<ApiResponse<Appointment>>('/appointments', payload);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create appointment');
    },

    async updateAppointment(id: string, payload: Partial<AppointmentPayload>): Promise<Appointment> {
        const response = await api.put<ApiResponse<Appointment>>(`/appointments/${id}`, payload);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update appointment');
    },

    async updateStatus(id: string, status: AppointmentStatus, cancellationReason?: string | null): Promise<Appointment> {
        const response = await api.patch<ApiResponse<Appointment>>(`/appointments/${id}/status`, {
            status,
            cancellationReason,
        });
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update status');
    },

    async getMeta(): Promise<AppointmentMeta> {
        const response = await api.get<ApiResponse<AppointmentMeta>>('/appointments/meta');
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to fetch metadata');
    },
};

export default appointmentService;
