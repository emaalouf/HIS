import { Role } from '@prisma/client';

export interface JWTPayload {
    userId: string;
    email: string;
    role: Role;
}

export interface AuthenticatedRequest extends Express.Request {
    user?: JWTPayload;
}

export interface PaginationQuery {
    page?: string;
    limit?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
