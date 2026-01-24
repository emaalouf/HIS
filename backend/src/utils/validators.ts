import { z } from 'zod';
import {
    Role,
    Gender,
    BloodType,
    AppointmentStatus,
    DialysisStatus,
    DialysisStationStatus,
    DialysisScheduleRecurrence,
    DialysisMedicationRoute,
} from '@prisma/client';

// Auth Schemas
export const registerSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        firstName: z.string().min(1, 'First name is required'),
        lastName: z.string().min(1, 'Last name is required'),
        role: z.nativeEnum(Role).optional(),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(1, 'Password is required'),
    }),
});

// Patient Schemas
export const createPatientSchema = z.object({
    body: z.object({
        firstName: z.string().min(1, 'First name is required'),
        lastName: z.string().min(1, 'Last name is required'),
        dateOfBirth: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid date format',
        }),
        gender: z.nativeEnum(Gender),
        bloodType: z.nativeEnum(BloodType).optional(),
        email: z.string().email().optional().nullable(),
        phone: z.string().min(1, 'Phone number is required'),
        address: z.string().optional().nullable(),
        city: z.string().optional().nullable(),
        country: z.string().optional().nullable(),
        emergencyContactName: z.string().optional().nullable(),
        emergencyContactPhone: z.string().optional().nullable(),
        emergencyContactRelation: z.string().optional().nullable(),
        allergies: z.array(z.string()).optional(),
        chronicConditions: z.array(z.string()).optional(),
    }),
});

export const updatePatientSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Patient ID is required'),
    }),
    body: z.object({
        firstName: z.string().min(1).optional(),
        lastName: z.string().min(1).optional(),
        dateOfBirth: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid date format',
        }).optional(),
        gender: z.nativeEnum(Gender).optional(),
        bloodType: z.nativeEnum(BloodType).optional(),
        email: z.string().email().optional().nullable(),
        phone: z.string().min(1).optional(),
        address: z.string().optional().nullable(),
        city: z.string().optional().nullable(),
        country: z.string().optional().nullable(),
        emergencyContactName: z.string().optional().nullable(),
        emergencyContactPhone: z.string().optional().nullable(),
        emergencyContactRelation: z.string().optional().nullable(),
        allergies: z.array(z.string()).optional(),
        chronicConditions: z.array(z.string()).optional(),
        isActive: z.boolean().optional(),
    }),
});

// Medical History Schema
export const createMedicalHistorySchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Patient ID is required'),
    }),
    body: z.object({
        diagnosis: z.string().min(1, 'Diagnosis is required'),
        treatment: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
        visitDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid date format',
        }),
    }),
});

// Appointment Schemas
export const createAppointmentSchema = z.object({
    body: z.object({
        patientId: z.string().min(1, 'Patient ID is required'),
        providerId: z.string().min(1, 'Provider ID is required'),
        visitTypeId: z.string().optional().nullable(),
        locationId: z.string().optional().nullable(),
        startTime: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid start time',
        }),
        endTime: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid end time',
        }),
        reason: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
    }).refine((data) => {
        return new Date(data.endTime).getTime() > new Date(data.startTime).getTime();
    }, {
        message: 'End time must be after start time',
        path: ['endTime'],
    }),
});

export const updateAppointmentSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Appointment ID is required'),
    }),
    body: z.object({
        patientId: z.string().min(1).optional(),
        providerId: z.string().min(1).optional(),
        visitTypeId: z.string().optional().nullable(),
        locationId: z.string().optional().nullable(),
        startTime: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid start time',
        }).optional(),
        endTime: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid end time',
        }).optional(),
        reason: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
    }).refine((data) => {
        if (!data.startTime || !data.endTime) return true;
        return new Date(data.endTime).getTime() > new Date(data.startTime).getTime();
    }, {
        message: 'End time must be after start time',
        path: ['endTime'],
    }),
});

export const updateAppointmentStatusSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Appointment ID is required'),
    }),
    body: z.object({
        status: z.nativeEnum(AppointmentStatus),
        cancellationReason: z.string().optional().nullable(),
    }),
});

// Dialysis Schemas
export const createDialysisSessionSchema = z.object({
    body: z.object({
        patientId: z.string().min(1, 'Patient ID is required'),
        providerId: z.string().min(1, 'Provider ID is required'),
        status: z.nativeEnum(DialysisStatus).optional(),
        startTime: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid start time',
        }),
        endTime: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid end time',
        }),
        machineNumber: z.string().optional().nullable(),
        accessType: z.string().optional().nullable(),
        dialyzer: z.string().optional().nullable(),
        dialysate: z.string().optional().nullable(),
        bloodFlowRate: z.number().optional(),
        dialysateFlowRate: z.number().optional(),
        ultrafiltrationVolume: z.number().optional(),
        weightPre: z.number().optional(),
        weightPost: z.number().optional(),
        notes: z.string().optional().nullable(),
    }).refine((data) => {
        return new Date(data.endTime).getTime() > new Date(data.startTime).getTime();
    }, {
        message: 'End time must be after start time',
        path: ['endTime'],
    }),
});

export const updateDialysisSessionSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Session ID is required'),
    }),
    body: z.object({
        patientId: z.string().min(1).optional(),
        providerId: z.string().min(1).optional(),
        status: z.nativeEnum(DialysisStatus).optional(),
        startTime: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid start time',
        }).optional(),
        endTime: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid end time',
        }).optional(),
        machineNumber: z.string().optional().nullable(),
        accessType: z.string().optional().nullable(),
        dialyzer: z.string().optional().nullable(),
        dialysate: z.string().optional().nullable(),
        bloodFlowRate: z.number().optional(),
        dialysateFlowRate: z.number().optional(),
        ultrafiltrationVolume: z.number().optional(),
        weightPre: z.number().optional(),
        weightPost: z.number().optional(),
        notes: z.string().optional().nullable(),
    }).refine((data) => {
        if (!data.startTime || !data.endTime) return true;
        return new Date(data.endTime).getTime() > new Date(data.startTime).getTime();
    }, {
        message: 'End time must be after start time',
        path: ['endTime'],
    }),
});

export const createDialysisPrescriptionSchema = z.object({
    body: z.object({
        patientId: z.string().min(1, 'Patient ID is required'),
        providerId: z.string().optional().nullable(),
        dryWeight: z.number().optional(),
        targetUltrafiltration: z.number().optional(),
        durationMinutes: z.number().optional(),
        dialyzer: z.string().optional().nullable(),
        dialysate: z.string().optional().nullable(),
        bloodFlowRate: z.number().optional(),
        dialysateFlowRate: z.number().optional(),
        accessType: z.string().optional().nullable(),
        frequency: z.string().optional().nullable(),
        isActive: z.boolean().optional(),
        notes: z.string().optional().nullable(),
        startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid start date',
        }).optional(),
        endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid end date',
        }).optional(),
    }),
});

export const updateDialysisPrescriptionSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Prescription ID is required'),
    }),
    body: z.object({
        patientId: z.string().min(1).optional(),
        providerId: z.string().optional().nullable(),
        dryWeight: z.number().optional(),
        targetUltrafiltration: z.number().optional(),
        durationMinutes: z.number().optional(),
        dialyzer: z.string().optional().nullable(),
        dialysate: z.string().optional().nullable(),
        bloodFlowRate: z.number().optional(),
        dialysateFlowRate: z.number().optional(),
        accessType: z.string().optional().nullable(),
        frequency: z.string().optional().nullable(),
        isActive: z.boolean().optional(),
        notes: z.string().optional().nullable(),
        startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid start date',
        }).optional(),
        endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid end date',
        }).optional(),
    }),
});

export const createDialysisFlowsheetSchema = z.object({
    body: z.object({
        sessionId: z.string().min(1, 'Session ID is required'),
        recordedAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid recorded time',
        }),
        bpSystolic: z.number().optional(),
        bpDiastolic: z.number().optional(),
        heartRate: z.number().optional(),
        temperature: z.number().optional(),
        oxygenSaturation: z.number().optional(),
        bloodFlowRate: z.number().optional(),
        dialysateFlowRate: z.number().optional(),
        ultrafiltrationVolume: z.number().optional(),
        arterialPressure: z.number().optional(),
        venousPressure: z.number().optional(),
        transmembranePressure: z.number().optional(),
        alarms: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
    }),
});

export const updateDialysisFlowsheetSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Entry ID is required'),
    }),
    body: z.object({
        sessionId: z.string().min(1).optional(),
        recordedAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid recorded time',
        }).optional(),
        bpSystolic: z.number().optional(),
        bpDiastolic: z.number().optional(),
        heartRate: z.number().optional(),
        temperature: z.number().optional(),
        oxygenSaturation: z.number().optional(),
        bloodFlowRate: z.number().optional(),
        dialysateFlowRate: z.number().optional(),
        ultrafiltrationVolume: z.number().optional(),
        arterialPressure: z.number().optional(),
        venousPressure: z.number().optional(),
        transmembranePressure: z.number().optional(),
        alarms: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
    }),
});

export const createDialysisStationSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Station name is required'),
        room: z.string().optional().nullable(),
        machineNumber: z.string().optional().nullable(),
        status: z.nativeEnum(DialysisStationStatus).optional(),
        lastServiceDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid last service date',
        }).optional(),
        nextServiceDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid next service date',
        }).optional(),
        notes: z.string().optional().nullable(),
        isActive: z.boolean().optional(),
    }),
});

export const updateDialysisStationSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Station ID is required'),
    }),
    body: z.object({
        name: z.string().min(1).optional(),
        room: z.string().optional().nullable(),
        machineNumber: z.string().optional().nullable(),
        status: z.nativeEnum(DialysisStationStatus).optional(),
        lastServiceDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid last service date',
        }).optional(),
        nextServiceDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid next service date',
        }).optional(),
        notes: z.string().optional().nullable(),
        isActive: z.boolean().optional(),
    }),
});

export const createDialysisScheduleSchema = z.object({
    body: z.object({
        patientId: z.string().min(1, 'Patient ID is required'),
        providerId: z.string().optional().nullable(),
        stationId: z.string().optional().nullable(),
        startTime: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid start time',
        }),
        durationMinutes: z.number().min(1, 'Duration is required'),
        recurrence: z.nativeEnum(DialysisScheduleRecurrence).optional(),
        daysOfWeek: z.array(z.string()).optional(),
        endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid end date',
        }).optional(),
        isActive: z.boolean().optional(),
        notes: z.string().optional().nullable(),
    }),
});

export const updateDialysisScheduleSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Schedule ID is required'),
    }),
    body: z.object({
        patientId: z.string().min(1).optional(),
        providerId: z.string().optional().nullable(),
        stationId: z.string().optional().nullable(),
        startTime: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid start time',
        }).optional(),
        durationMinutes: z.number().min(1).optional(),
        recurrence: z.nativeEnum(DialysisScheduleRecurrence).optional(),
        daysOfWeek: z.array(z.string()).optional(),
        endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid end date',
        }).optional(),
        isActive: z.boolean().optional(),
        notes: z.string().optional().nullable(),
    }),
});

export const createDialysisLabSchema = z.object({
    body: z.object({
        patientId: z.string().min(1, 'Patient ID is required'),
        collectedAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid collection date',
        }),
        ktv: z.number().optional(),
        urr: z.number().optional(),
        hemoglobin: z.number().optional(),
        potassium: z.number().optional(),
        sodium: z.number().optional(),
        calcium: z.number().optional(),
        phosphorus: z.number().optional(),
        bicarbonate: z.number().optional(),
        albumin: z.number().optional(),
        creatinine: z.number().optional(),
        notes: z.string().optional().nullable(),
    }),
});

export const updateDialysisLabSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Lab result ID is required'),
    }),
    body: z.object({
        patientId: z.string().min(1).optional(),
        collectedAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid collection date',
        }).optional(),
        ktv: z.number().optional(),
        urr: z.number().optional(),
        hemoglobin: z.number().optional(),
        potassium: z.number().optional(),
        sodium: z.number().optional(),
        calcium: z.number().optional(),
        phosphorus: z.number().optional(),
        bicarbonate: z.number().optional(),
        albumin: z.number().optional(),
        creatinine: z.number().optional(),
        notes: z.string().optional().nullable(),
    }),
});

export const createDialysisMedicationSchema = z.object({
    body: z.object({
        patientId: z.string().min(1, 'Patient ID is required'),
        medicationName: z.string().min(1, 'Medication name is required'),
        dose: z.string().optional().nullable(),
        route: z.nativeEnum(DialysisMedicationRoute).optional(),
        frequency: z.string().optional().nullable(),
        startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid start date',
        }).optional(),
        endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid end date',
        }).optional(),
        lastAdministeredAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid administration time',
        }).optional(),
        isActive: z.boolean().optional(),
        notes: z.string().optional().nullable(),
    }),
});

export const updateDialysisMedicationSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Medication order ID is required'),
    }),
    body: z.object({
        patientId: z.string().min(1).optional(),
        medicationName: z.string().min(1).optional(),
        dose: z.string().optional().nullable(),
        route: z.nativeEnum(DialysisMedicationRoute).optional(),
        frequency: z.string().optional().nullable(),
        startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid start date',
        }).optional(),
        endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid end date',
        }).optional(),
        lastAdministeredAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid administration time',
        }).optional(),
        isActive: z.boolean().optional(),
        notes: z.string().optional().nullable(),
    }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type CreatePatientInput = z.infer<typeof createPatientSchema>['body'];
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>['body'];
export type CreateMedicalHistoryInput = z.infer<typeof createMedicalHistorySchema>['body'];
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>['body'];
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>['body'];
export type UpdateAppointmentStatusInput = z.infer<typeof updateAppointmentStatusSchema>['body'];
export type CreateDialysisSessionInput = z.infer<typeof createDialysisSessionSchema>['body'];
export type UpdateDialysisSessionInput = z.infer<typeof updateDialysisSessionSchema>['body'];
export type CreateDialysisPrescriptionInput = z.infer<typeof createDialysisPrescriptionSchema>['body'];
export type UpdateDialysisPrescriptionInput = z.infer<typeof updateDialysisPrescriptionSchema>['body'];
export type CreateDialysisFlowsheetInput = z.infer<typeof createDialysisFlowsheetSchema>['body'];
export type UpdateDialysisFlowsheetInput = z.infer<typeof updateDialysisFlowsheetSchema>['body'];
export type CreateDialysisStationInput = z.infer<typeof createDialysisStationSchema>['body'];
export type UpdateDialysisStationInput = z.infer<typeof updateDialysisStationSchema>['body'];
export type CreateDialysisScheduleInput = z.infer<typeof createDialysisScheduleSchema>['body'];
export type UpdateDialysisScheduleInput = z.infer<typeof updateDialysisScheduleSchema>['body'];
export type CreateDialysisLabInput = z.infer<typeof createDialysisLabSchema>['body'];
export type UpdateDialysisLabInput = z.infer<typeof updateDialysisLabSchema>['body'];
export type CreateDialysisMedicationInput = z.infer<typeof createDialysisMedicationSchema>['body'];
export type UpdateDialysisMedicationInput = z.infer<typeof updateDialysisMedicationSchema>['body'];
