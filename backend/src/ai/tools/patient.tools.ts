import { tool } from '@openai/agents';
import { patientService } from '../../services/patient.service';

type SearchPatientsArgs = {
  query: string;
  page?: number;
  limit?: number;
};

type PatientIdArgs = {
  patientId: string;
};

export const searchPatients = tool({
  name: 'search_patients',
  description: 'Search for patients by name, MRN, phone number, or email. Returns a paginated list of matching patients.',
  strict: false,
  parameters: ({
    type: 'object',
    additionalProperties: true,
    properties: {
      query: { type: 'string', description: 'Search term: patient name, MRN, phone, or email' },
      page: { type: 'number', description: 'Page number (default: 1)' },
      limit: { type: 'number', description: 'Results per page (default: 10, max: 20)' },
    },
    required: ['query'],
  }) as const,
  execute: async (input) => {
    const args = input as SearchPatientsArgs;
    const result = await patientService.findAll({
      page: args.page || 1,
      limit: Math.min(args.limit || 10, 20),
      search: args.query,
    });
    return JSON.stringify({
      patients: result.patients,
      total: result.total,
    });
  },
});

export const getPatientDetails = tool({
  name: 'get_patient_details',
  description: 'Get full details for a specific patient including medical history and documents. Requires the patient ID.',
  strict: false,
  parameters: ({
    type: 'object',
    additionalProperties: true,
    properties: {
      patientId: { type: 'string', description: 'The patient ID (cuid)' },
    },
    required: ['patientId'],
  }) as const,
  execute: async (input) => {
    const args = input as PatientIdArgs;
    const patient = await patientService.findById(args.patientId);
    if (!patient) return JSON.stringify({ error: 'Patient not found' });
    return JSON.stringify(patient);
  },
});

export const getPatientMedicalHistory = tool({
  name: 'get_patient_medical_history',
  description: 'Get the medical history records for a specific patient. Returns diagnoses, treatments, and visit dates.',
  strict: false,
  parameters: ({
    type: 'object',
    additionalProperties: true,
    properties: {
      patientId: { type: 'string', description: 'The patient ID' },
    },
    required: ['patientId'],
  }) as const,
  execute: async (input) => {
    const args = input as PatientIdArgs;
    const history = await patientService.getMedicalHistory(args.patientId);
    return JSON.stringify(history);
  },
});

export const getPatientStats = tool({
  name: 'get_patient_stats',
  description: 'Get overall patient statistics: total count, active patients, and today\'s registrations.',
  strict: false,
  parameters: ({
    type: 'object',
    additionalProperties: true,
    properties: {},
    required: [],
  }) as const,
  execute: async () => {
    const stats = await patientService.getStats();
    return JSON.stringify(stats);
  },
});

export const patientTools = [
  searchPatients,
  getPatientDetails,
  getPatientMedicalHistory,
  getPatientStats,
];
