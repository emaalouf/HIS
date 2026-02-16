import api from './api';
import type { 
  BloodProduct, 
  CreateBloodProductRequest, 
  UpdateBloodProductRequest,
  ApiResponse,
  BloodProductType,
  BloodProductStatus,
  BloodTypeBB
} from '../types';

export interface BloodProductsResponse {
  products: BloodProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetBloodProductsParams {
  page?: number;
  limit?: number;
  productType?: BloodProductType;
  bloodType?: BloodTypeBB;
  status?: BloodProductStatus;
  search?: string;
  expiringBefore?: string;
}

export interface BloodInventoryItem {
  bloodType: BloodTypeBB;
  productType: BloodProductType;
  _count: { id: number };
  _sum: { volume: number | null };
}

export const bloodProductService = {
  async getBloodProducts(params: GetBloodProductsParams = {}): Promise<BloodProductsResponse> {
    const response = await api.get<ApiResponse<BloodProduct[]>>('/blood-products', { params });
    if (response.data.success && response.data.data) {
      return {
        products: response.data.data,
        pagination: response.data.pagination!,
      };
    }
    throw new Error(response.data.error || 'Failed to get blood products');
  },

  async getBloodProduct(id: string): Promise<BloodProduct> {
    const response = await api.get<ApiResponse<BloodProduct>>(`/blood-products/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get blood product');
  },

  async createBloodProduct(data: CreateBloodProductRequest): Promise<BloodProduct> {
    const response = await api.post<ApiResponse<BloodProduct>>('/blood-products', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to create blood product');
  },

  async updateBloodProduct(id: string, data: UpdateBloodProductRequest): Promise<BloodProduct> {
    const response = await api.patch<ApiResponse<BloodProduct>>(`/blood-products/${id}`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to update blood product');
  },

  async getInventoryByBloodType(): Promise<BloodInventoryItem[]> {
    const response = await api.get<ApiResponse<BloodInventoryItem[]>>('/blood-products/inventory');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get inventory');
  },

  async getExpiringProducts(days: number = 7): Promise<BloodProduct[]> {
    const response = await api.get<ApiResponse<BloodProduct[]>>('/blood-products/expiring', { params: { days } });
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get expiring products');
  },

  async getLowStockProducts(threshold: number = 10): Promise<BloodInventoryItem[]> {
    const response = await api.get<ApiResponse<BloodInventoryItem[]>>('/blood-products/low-stock', { params: { threshold } });
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get low stock products');
  },
};
