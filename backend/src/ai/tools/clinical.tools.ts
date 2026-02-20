import { tool } from '@openai/agents';
import { encounterService } from '../../services/encounter.service';
import { admissionService } from '../../services/admission.service';
import { clinicalOrderService } from '../../services/clinical-order.service';
import { medicationOrderService } from '../../services/medication-order.service';

type SearchEncountersArgs = {
  patientId?: string;
  providerId?: string;
  status?: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
};

type SearchAdmissionsArgs = {
  patientId?: string;
  providerId?: string;
  wardId?: string;
  departmentId?: string;
  status?: 'ADMITTED' | 'DISCHARGED' | 'TRANSFERRED' | 'CANCELLED';
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
};

type SearchClinicalOrdersArgs = {
  patientId?: string;
  providerId?: string;
  orderType?: 'LAB' | 'IMAGING' | 'MEDICATION' | 'PROCEDURE' | 'OTHER';
  status?: 'ORDERED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  page?: number;
  limit?: number;
};

type SearchMedicationOrdersArgs = {
  patientId?: string;
  providerId?: string;
  status?: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'DISCONTINUED';
  page?: number;
  limit?: number;
};

export const searchEncounters = tool({
  name: 'search_encounters',
  description: 'Search patient encounters (visits). Can filter by patient, provider, status, and date range.',
  strict: false,
  parameters: ({
    type: 'object',
    additionalProperties: true,
    properties: {
      patientId: { type: 'string', description: 'Filter by patient ID' },
      providerId: { type: 'string', description: 'Filter by provider ID' },
      status: { type: 'string', enum: ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], description: 'Filter by encounter status' },
      startDate: { type: 'string', description: 'Filter from this date (ISO format)' },
      endDate: { type: 'string', description: 'Filter until this date (ISO format)' },
      page: { type: 'number' },
      limit: { type: 'number' },
    },
    required: [],
  }) as const,
  execute: async (input) => {
    const args = input as SearchEncountersArgs;
    const result = await encounterService.list({
      page: args.page || 1,
      limit: Math.min(args.limit || 10, 20),
      patientId: args.patientId,
      providerId: args.providerId,
      status: args.status as any,
      startDate: args.startDate,
      endDate: args.endDate,
    });
    return JSON.stringify({
      encounters: result.encounters,
      total: result.total,
    });
  },
});

export const searchAdmissions = tool({
  name: 'search_admissions',
  description: 'Search patient admissions. Can filter by patient, provider, ward, department, status, and date range.',
  strict: false,
  parameters: ({
    type: 'object',
    additionalProperties: true,
    properties: {
      patientId: { type: 'string', description: 'Filter by patient ID' },
      providerId: { type: 'string', description: 'Filter by provider ID' },
      wardId: { type: 'string', description: 'Filter by ward ID' },
      departmentId: { type: 'string', description: 'Filter by department ID' },
      status: { type: 'string', enum: ['ADMITTED', 'DISCHARGED', 'TRANSFERRED', 'CANCELLED'], description: 'Filter by admission status' },
      startDate: { type: 'string', description: 'Filter from this date (ISO format)' },
      endDate: { type: 'string', description: 'Filter until this date (ISO format)' },
      search: { type: 'string', description: 'Search by patient name, MRN, or diagnosis' },
      page: { type: 'number' },
      limit: { type: 'number' },
    },
    required: [],
  }) as const,
  execute: async (input) => {
    const args = input as SearchAdmissionsArgs;
    const result = await admissionService.list({
      page: args.page || 1,
      limit: Math.min(args.limit || 10, 20),
      patientId: args.patientId,
      providerId: args.providerId,
      wardId: args.wardId,
      departmentId: args.departmentId,
      status: args.status as any,
      startDate: args.startDate,
      endDate: args.endDate,
      search: args.search,
    });
    return JSON.stringify({
      admissions: result.admissions,
      total: result.total,
    });
  },
});

export const searchClinicalOrders = tool({
  name: 'search_clinical_orders',
  description: 'Search clinical orders (lab, imaging, medication, procedure). Can filter by patient, type, and status.',
  strict: false,
  parameters: ({
    type: 'object',
    additionalProperties: true,
    properties: {
      patientId: { type: 'string', description: 'Filter by patient ID' },
      providerId: { type: 'string', description: 'Filter by ordering provider ID' },
      orderType: { type: 'string', enum: ['LAB', 'IMAGING', 'MEDICATION', 'PROCEDURE', 'OTHER'], description: 'Filter by order type' },
      status: { type: 'string', enum: ['ORDERED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], description: 'Filter by order status' },
      page: { type: 'number' },
      limit: { type: 'number' },
    },
    required: [],
  }) as const,
  execute: async (input) => {
    const args = input as SearchClinicalOrdersArgs;
    const result = await clinicalOrderService.list({
      page: args.page || 1,
      limit: Math.min(args.limit || 10, 20),
      patientId: args.patientId,
      providerId: args.providerId,
      orderType: args.orderType as any,
      status: args.status as any,
    });
    return JSON.stringify({
      orders: result.orders,
      total: result.total,
    });
  },
});

export const searchMedicationOrders = tool({
  name: 'search_medication_orders',
  description: 'Search medication orders for patients. Can filter by patient, provider, and status.',
  strict: false,
  parameters: ({
    type: 'object',
    additionalProperties: true,
    properties: {
      patientId: { type: 'string', description: 'Filter by patient ID' },
      providerId: { type: 'string', description: 'Filter by prescribing provider ID' },
      status: { type: 'string', enum: ['ACTIVE', 'ON_HOLD', 'COMPLETED', 'DISCONTINUED'], description: 'Filter by medication order status' },
      page: { type: 'number' },
      limit: { type: 'number' },
    },
    required: [],
  }) as const,
  execute: async (input) => {
    const args = input as SearchMedicationOrdersArgs;
    const result = await medicationOrderService.list({
      page: args.page || 1,
      limit: Math.min(args.limit || 10, 20),
      patientId: args.patientId,
      providerId: args.providerId,
      status: args.status as any,
    });
    return JSON.stringify({
      medicationOrders: result.orders,
      total: result.total,
    });
  },
});

export const clinicalTools = [
  searchEncounters,
  searchAdmissions,
  searchClinicalOrders,
  searchMedicationOrders,
];
