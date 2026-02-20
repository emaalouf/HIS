import { tool } from '@openai/agents';
import { appointmentService } from '../../services/appointment.service';

type SearchAppointmentsArgs = {
  providerId?: string;
  patientId?: string;
  status?: 'SCHEDULED' | 'CONFIRMED' | 'CHECKED_IN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
};

type AppointmentIdArgs = {
  appointmentId: string;
};

type ProviderIdArgs = {
  providerId?: string;
};

function normalizeDateBoundary(date: string | undefined, isEnd: boolean): string | undefined {
  if (!date) return undefined;

  // If time is already provided, keep original value.
  if (date.includes('T')) return date;

  // Date-only input should cover the full calendar day.
  if (isEnd) {
    return `${date}T23:59:59.999Z`;
  }
  return `${date}T00:00:00.000Z`;
}

export const searchAppointments = tool({
  name: 'search_appointments',
  description: 'Search appointments with filters. Can filter by provider, patient, status, and date range.',
  strict: false,
  parameters: ({
    type: 'object',
    additionalProperties: true,
    properties: {
      providerId: { type: 'string', description: 'Filter by provider ID' },
      patientId: { type: 'string', description: 'Filter by patient ID' },
      status: {
        type: 'string',
        enum: ['SCHEDULED', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
        description: 'Filter by appointment status',
      },
      startDate: { type: 'string', description: 'Filter appointments from this date (ISO format, e.g. 2026-01-15)' },
      endDate: { type: 'string', description: 'Filter appointments until this date (ISO format)' },
      search: { type: 'string', description: 'Search by patient name, MRN, or phone' },
      page: { type: 'number', description: 'Page number (default: 1)' },
      limit: { type: 'number', description: 'Results per page (default: 10, max: 20)' },
    },
    required: [],
  }) as const,
  execute: async (input) => {
    const args = input as SearchAppointmentsArgs;
    const startDate = normalizeDateBoundary(args.startDate, false);
    const endDate = normalizeDateBoundary(args.endDate, true);

    const result = await appointmentService.list({
      page: args.page || 1,
      limit: Math.min(args.limit || 10, 20),
      providerId: args.providerId,
      patientId: args.patientId,
      status: args.status as any,
      startDate,
      endDate,
      search: args.search,
    });
    return JSON.stringify({
      appointments: result.appointments,
      total: result.total,
    });
  },
});

export const getAppointmentDetails = tool({
  name: 'get_appointment_details',
  description: 'Get full details for a specific appointment including patient, provider, visit type, and location.',
  strict: false,
  parameters: ({
    type: 'object',
    additionalProperties: true,
    properties: {
      appointmentId: { type: 'string', description: 'The appointment ID' },
    },
    required: ['appointmentId'],
  }) as const,
  execute: async (input) => {
    const args = input as AppointmentIdArgs;
    const appointment = await appointmentService.findById(args.appointmentId);
    if (!appointment) return JSON.stringify({ error: 'Appointment not found' });
    return JSON.stringify(appointment);
  },
});

export const getTodayAppointments = tool({
  name: 'get_today_appointments',
  description: 'Get all appointments scheduled for today. Optionally filter by provider.',
  strict: false,
  parameters: ({
    type: 'object',
    additionalProperties: true,
    properties: {
      providerId: { type: 'string', description: 'Filter by provider ID' },
    },
    required: [],
  }) as const,
  execute: async (input) => {
    const args = input as ProviderIdArgs;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const result = await appointmentService.list({
      page: 1,
      limit: 50,
      providerId: args.providerId,
      startDate: today.toISOString(),
      endDate: tomorrow.toISOString(),
    });
    return JSON.stringify({
      appointments: result.appointments,
      total: result.total,
    });
  },
});

export const appointmentTools = [
  searchAppointments,
  getAppointmentDetails,
  getTodayAppointments,
];
