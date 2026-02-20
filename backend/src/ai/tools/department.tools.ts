import { tool } from '@openai/agents';
import { departmentService } from '../../services/department.service';
import { wardService } from '../../services/ward.service';
import { bedService } from '../../services/bed.service';
import prisma from '../../config/database';

type ListDepartmentsArgs = {
  search?: string;
  isActive?: boolean;
};

type SearchProvidersArgs = {
  search?: string;
  departmentId?: string;
  role?: 'ADMIN' | 'DOCTOR' | 'NURSE' | 'RECEPTIONIST';
};

type WardInfoArgs = {
  wardId?: string;
  search?: string;
};

type BedAvailabilityArgs = {
  wardId?: string;
  status?: 'AVAILABLE' | 'OCCUPIED' | 'CLEANING' | 'MAINTENANCE';
};

export const listDepartments = tool({
  name: 'list_departments',
  description: 'List all hospital departments. Can filter by name or active status.',
  strict: false,
  parameters: ({
    type: 'object',
    additionalProperties: true,
    properties: {
      search: { type: 'string', description: 'Search by department name' },
      isActive: { type: 'boolean', description: 'Filter by active status' },
    },
    required: [],
  }) as const,
  execute: async (input) => {
    const args = input as ListDepartmentsArgs;
    const result = await departmentService.list({
      page: 1,
      limit: 50,
      search: args.search,
      isActive: args.isActive,
    });
    return JSON.stringify({
      departments: result.departments,
      total: result.total,
    });
  },
});

export const searchProviders = tool({
  name: 'search_providers',
  description: 'Search for doctors and healthcare providers by name, specialty, or department.',
  strict: false,
  parameters: ({
    type: 'object',
    additionalProperties: true,
    properties: {
      search: { type: 'string', description: 'Search by provider name' },
      departmentId: { type: 'string', description: 'Filter by department ID' },
      role: {
        type: 'string',
        enum: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'],
        description: 'Filter by role',
      },
    },
    required: [],
  }) as const,
  execute: async (input) => {
    const args = input as SearchProvidersArgs;
    const where: any = { isActive: true };
    if (args.role) where.role = args.role;
    if (args.departmentId) where.departmentId = args.departmentId;
    if (args.search) {
      where.OR = [
        { firstName: { contains: args.search } },
        { lastName: { contains: args.search } },
        { specialty: { contains: args.search } },
      ];
    }

    const providers = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        specialty: true,
        department: { select: { id: true, name: true } },
      },
      take: 20,
      orderBy: { firstName: 'asc' },
    });
    return JSON.stringify(providers);
  },
});

export const getWardInfo = tool({
  name: 'get_ward_info',
  description: 'Get information about hospital wards, including bed counts.',
  strict: false,
  parameters: ({
    type: 'object',
    additionalProperties: true,
    properties: {
      wardId: { type: 'string', description: 'Specific ward ID to get details for' },
      search: { type: 'string', description: 'Search wards by name' },
    },
    required: [],
  }) as const,
  execute: async (input) => {
    const args = input as WardInfoArgs;
    if (args.wardId) {
      const ward = await wardService.findById(args.wardId);
      if (!ward) return JSON.stringify({ error: 'Ward not found' });
      return JSON.stringify(ward);
    }
    const result = await wardService.list({
      page: 1,
      limit: 50,
      search: args.search,
    });
    return JSON.stringify({
      wards: result.wards,
      total: result.total,
    });
  },
});

export const getBedAvailability = tool({
  name: 'get_bed_availability',
  description: 'Check bed availability across the hospital. Can filter by ward, status, or room.',
  strict: false,
  parameters: ({
    type: 'object',
    additionalProperties: true,
    properties: {
      wardId: { type: 'string', description: 'Filter by ward ID' },
      status: {
        type: 'string',
        enum: ['AVAILABLE', 'OCCUPIED', 'CLEANING', 'MAINTENANCE'],
        description: 'Filter by bed status',
      },
    },
    required: [],
  }) as const,
  execute: async (input) => {
    const args = input as BedAvailabilityArgs;
    const result = await bedService.list({
      page: 1,
      limit: 50,
      wardId: args.wardId,
      status: args.status as any,
    });
    return JSON.stringify({
      beds: result.beds,
      total: result.total,
    });
  },
});

export const departmentTools = [
  listDepartments,
  searchProviders,
  getWardInfo,
  getBedAvailability,
];
