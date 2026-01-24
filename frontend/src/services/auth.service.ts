import api from './api';
import type { ApiResponse, LoginRequest, LoginResponse, User } from '../types';

export const authService = {
    async login(data: LoginRequest): Promise<LoginResponse> {
        const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', data);
        if (response.data.success && response.data.data) {
            const { accessToken, refreshToken, user } = response.data.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));
            return response.data.data;
        }
        throw new Error(response.data.error || 'Login failed');
    },

    async getMe(): Promise<User> {
        const response = await api.get<ApiResponse<User>>('/auth/me');
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.error || 'Failed to get user');
    },

    logout(): void {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
    },

    getStoredUser(): User | null {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch {
                return null;
            }
        }
        return null;
    },

    isAuthenticated(): boolean {
        return !!localStorage.getItem('accessToken');
    },
};

export default authService;
