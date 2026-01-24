import api from './api';
import type {
    ApiResponse,
    DialysisFlowsheetEntry,
    CreateDialysisFlowsheetEntryRequest,
} from '../types';

export interface DialysisFlowsheetResponse {
    entries: DialysisFlowsheetEntry[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetDialysisFlowsheetParams {
    page?: number;
    limit?: number;
    sessionId?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const dialysisFlowsheetService = {
    async getEntries(params: GetDialysisFlowsheetParams = {}): Promise<DialysisFlowsheetResponse> {
        const response = await api.get<ApiResponse<DialysisFlowsheetEntry[]>>('/dialysis-flowsheets', { params });
        if (response.data.success && response.data.data) {
            return {
                entries: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get dialysis flowsheet entries');
    },

    async getEntry(id: string): Promise<DialysisFlowsheetEntry> {
        const response = await api.get<ApiResponse<DialysisFlowsheetEntry>>(`/dialysis-flowsheets/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get dialysis flowsheet entry');
    },

    async createEntry(data: CreateDialysisFlowsheetEntryRequest): Promise<DialysisFlowsheetEntry> {
        const response = await api.post<ApiResponse<DialysisFlowsheetEntry>>('/dialysis-flowsheets', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create dialysis flowsheet entry');
    },

    async updateEntry(id: string, data: Partial<CreateDialysisFlowsheetEntryRequest>): Promise<DialysisFlowsheetEntry> {
        const response = await api.put<ApiResponse<DialysisFlowsheetEntry>>(`/dialysis-flowsheets/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update dialysis flowsheet entry');
    },

    async deleteEntry(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/dialysis-flowsheets/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete dialysis flowsheet entry');
        }
    },
};

export default dialysisFlowsheetService;
