import api from './api';
import type { 
  LabWorkOrder, 
  CreateLabWorkOrderRequest, 
  UpdateLabWorkOrderRequest,
  VerifyLabWorkOrderRequest,
  ApiResponse,
  LabWorkOrderStatus,
  OrderPriority
} from '../types';

export interface LabWorkOrdersResponse {
  workOrders: LabWorkOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetLabWorkOrdersParams {
  page?: number;
  limit?: number;
  patientId?: string;
  status?: LabWorkOrderStatus;
  priority?: OrderPriority;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface LabWorkOrderStats {
  byStatusAndPriority: { status: LabWorkOrderStatus; priority: OrderPriority; _count: { id: number } }[];
  today: number;
  pendingSTAT: number;
}

export const labWorkOrderService = {
  async getWorkOrders(params: GetLabWorkOrdersParams = {}): Promise<LabWorkOrdersResponse> {
    const response = await api.get<ApiResponse<LabWorkOrder[]>>('/lab-work-orders', { params });
    if (response.data.success && response.data.data) {
      return {
        workOrders: response.data.data,
        pagination: response.data.pagination!,
      };
    }
    throw new Error(response.data.error || 'Failed to get work orders');
  },

  async getWorkOrder(id: string): Promise<LabWorkOrder> {
    const response = await api.get<ApiResponse<LabWorkOrder>>(`/lab-work-orders/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get work order');
  },

  async getWorkOrderByNumber(orderNumber: string): Promise<LabWorkOrder> {
    const response = await api.get<ApiResponse<LabWorkOrder>>(`/lab-work-orders/number/${orderNumber}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get work order by number');
  },

  async createWorkOrder(data: CreateLabWorkOrderRequest): Promise<LabWorkOrder> {
    const response = await api.post<ApiResponse<LabWorkOrder>>('/lab-work-orders', data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to create work order');
  },

  async updateWorkOrder(id: string, data: UpdateLabWorkOrderRequest): Promise<LabWorkOrder> {
    const response = await api.patch<ApiResponse<LabWorkOrder>>(`/lab-work-orders/${id}`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to update work order');
  },

  async verifyWorkOrder(id: string, data: VerifyLabWorkOrderRequest): Promise<LabWorkOrder> {
    const response = await api.post<ApiResponse<LabWorkOrder>>(`/lab-work-orders/${id}/verify`, data);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to verify work order');
  },

  async cancelWorkOrder(id: string, reason: string): Promise<LabWorkOrder> {
    const response = await api.post<ApiResponse<LabWorkOrder>>(`/lab-work-orders/${id}/cancel`, { reason });
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to cancel work order');
  },

  async getStats(): Promise<LabWorkOrderStats> {
    const response = await api.get<ApiResponse<LabWorkOrderStats>>('/lab-work-orders/stats');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to get work order stats');
  },
};
