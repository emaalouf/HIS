import api from './api';
import type {
    ApiResponse,
    Claim,
    ClaimStatus,
    CreateClaimRequest,
} from '../types';

export interface ClaimsResponse {
    claims: Claim[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface GetClaimsParams {
    page?: number;
    limit?: number;
    status?: ClaimStatus;
    patientId?: string;
    invoiceId?: string;
    payerName?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const claimService = {
    async getClaims(params: GetClaimsParams = {}): Promise<ClaimsResponse> {
        const response = await api.get<ApiResponse<Claim[]>>('/claims', { params });
        if (response.data.success && response.data.data) {
            return {
                claims: response.data.data,
                pagination: response.data.pagination!,
            };
        }
        throw new Error(response.data.error || 'Failed to get claims');
    },

    async getClaim(id: string): Promise<Claim> {
        const response = await api.get<ApiResponse<Claim>>(`/claims/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get claim');
    },

    async createClaim(data: CreateClaimRequest): Promise<Claim> {
        const response = await api.post<ApiResponse<Claim>>('/claims', data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to create claim');
    },

    async updateClaim(id: string, data: Partial<CreateClaimRequest>): Promise<Claim> {
        const response = await api.put<ApiResponse<Claim>>(`/claims/${id}`, data);
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to update claim');
    },

    async deleteClaim(id: string): Promise<void> {
        const response = await api.delete<ApiResponse>(`/claims/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to delete claim');
        }
    },
};

export default claimService;
