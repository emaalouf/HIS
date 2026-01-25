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
    CardiologyVisitStatus,
    CardiologyTestStatus,
    CardiologyProcedureStatus,
    CardiologyDeviceStatus,
    CardiologyMedicationRoute,
    CkdStage,
    NephrologyVisitStatus,
    NephrologyTestStatus,
    NephrologyProcedureStatus,
    NephrologyMedicationRoute,
    NephrologyImagingModality,
    NeurologyVisitStatus,
    EncounterStatus,
    OrderType,
    OrderStatus,
    OrderPriority,
    ResultStatus,
    ResultFlag,
    MedicationOrderStatus,
    MedicationRoute,
    MedicationAdministrationStatus,
    InvoiceStatus,
    PaymentMethod,
    ClaimStatus,
    AdmissionStatus,
    BedStatus,
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

// Cardiology Schemas
export const createCardiologyVisitSchema = z.object({
    body: z.object({
        patientId: z.string().min(1, 'Patient ID is required'),
        providerId: z.string().min(1, 'Provider ID is required'),
        status: z.nativeEnum(CardiologyVisitStatus).optional(),
        visitDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid visit date',
        }),
        reason: z.string().optional().nullable(),
        symptoms: z.string().optional().nullable(),
        diagnosis: z.string().optional().nullable(),
        assessment: z.string().optional().nullable(),
        plan: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
    }),
});

export const updateCardiologyVisitSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Visit ID is required'),
    }),
    body: z.object({
        patientId: z.string().min(1).optional(),
        providerId: z.string().min(1).optional(),
        status: z.nativeEnum(CardiologyVisitStatus).optional(),
        visitDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid visit date',
        }).optional(),
        reason: z.string().optional().nullable(),
        symptoms: z.string().optional().nullable(),
        diagnosis: z.string().optional().nullable(),
        assessment: z.string().optional().nullable(),
        plan: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
    }),
});

export const createCardiologyEcgSchema = z.object({
    body: z.object({
        patientId: z.string().min(1, 'Patient ID is required'),
        providerId: z.string().optional().nullable(),
        visitId: z.string().optional().nullable(),
        status: z.nativeEnum(CardiologyTestStatus).optional(),
        recordedAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid recorded time',
        }),
        type: z.string().optional().nullable(),
        rhythm: z.string().optional().nullable(),
        heartRate: z.number().optional(),
        prInterval: z.number().optional(),
        qrsDuration: z.number().optional(),
        qtInterval: z.number().optional(),
        qtc: z.number().optional(),
        interpretation: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
    }),
});

export const updateCardiologyEcgSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'ECG ID is required'),
    }),
    body: z.object({
        patientId: z.string().min(1).optional(),
        providerId: z.string().optional().nullable(),
        visitId: z.string().optional().nullable(),
        status: z.nativeEnum(CardiologyTestStatus).optional(),
        recordedAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid recorded time',
        }).optional(),
        type: z.string().optional().nullable(),
        rhythm: z.string().optional().nullable(),
        heartRate: z.number().optional(),
        prInterval: z.number().optional(),
        qrsDuration: z.number().optional(),
        qtInterval: z.number().optional(),
        qtc: z.number().optional(),
        interpretation: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
    }),
});

export const createCardiologyEchoSchema = z.object({
    body: z.object({
        patientId: z.string().min(1, 'Patient ID is required'),
        providerId: z.string().optional().nullable(),
        visitId: z.string().optional().nullable(),
        status: z.nativeEnum(CardiologyTestStatus).optional(),
        performedAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid performed time',
        }),
        type: z.string().optional().nullable(),
        lvef: z.number().optional(),
        lvEndDiastolicDia: z.number().optional(),
        lvEndSystolicDia: z.number().optional(),
        rvFunction: z.string().optional().nullable(),
        valveFindings: z.string().optional().nullable(),
        wallMotion: z.string().optional().nullable(),
        pericardialEffusion: z.boolean().optional(),
        summary: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
    }),
});

export const updateCardiologyEchoSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Echo ID is required'),
    }),
    body: z.object({
        patientId: z.string().min(1).optional(),
        providerId: z.string().optional().nullable(),
        visitId: z.string().optional().nullable(),
        status: z.nativeEnum(CardiologyTestStatus).optional(),
        performedAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid performed time',
        }).optional(),
        type: z.string().optional().nullable(),
        lvef: z.number().optional(),
        lvEndDiastolicDia: z.number().optional(),
        lvEndSystolicDia: z.number().optional(),
        rvFunction: z.string().optional().nullable(),
        valveFindings: z.string().optional().nullable(),
        wallMotion: z.string().optional().nullable(),
        pericardialEffusion: z.boolean().optional(),
        summary: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
    }),
});

export const createCardiologyStressTestSchema = z.object({
    body: z.object({
        patientId: z.string().min(1, 'Patient ID is required'),
        providerId: z.string().optional().nullable(),
        visitId: z.string().optional().nullable(),
        status: z.nativeEnum(CardiologyTestStatus).optional(),
        performedAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid performed time',
        }),
        type: z.string().optional().nullable(),
        protocol: z.string().optional().nullable(),
        durationMinutes: z.number().optional(),
        mets: z.number().optional(),
        maxHeartRate: z.number().optional(),
        maxBpSystolic: z.number().optional(),
        maxBpDiastolic: z.number().optional(),
        symptoms: z.string().optional().nullable(),
        result: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
    }),
});

export const updateCardiologyStressTestSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Stress test ID is required'),
    }),
    body: z.object({
        patientId: z.string().min(1).optional(),
        providerId: z.string().optional().nullable(),
        visitId: z.string().optional().nullable(),
        status: z.nativeEnum(CardiologyTestStatus).optional(),
        performedAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid performed time',
        }).optional(),
        type: z.string().optional().nullable(),
        protocol: z.string().optional().nullable(),
        durationMinutes: z.number().optional(),
        mets: z.number().optional(),
        maxHeartRate: z.number().optional(),
        maxBpSystolic: z.number().optional(),
        maxBpDiastolic: z.number().optional(),
        symptoms: z.string().optional().nullable(),
        result: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
    }),
});

export const createCardiologyProcedureSchema = z.object({
    body: z.object({
        patientId: z.string().min(1, 'Patient ID is required'),
        providerId: z.string().optional().nullable(),
        visitId: z.string().optional().nullable(),
        status: z.nativeEnum(CardiologyProcedureStatus).optional(),
        procedureDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid procedure date',
        }),
        type: z.string().optional().nullable(),
        indication: z.string().optional().nullable(),
        findings: z.string().optional().nullable(),
        complications: z.string().optional().nullable(),
        outcome: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
    }),
});

export const updateCardiologyProcedureSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Procedure ID is required'),
    }),
    body: z.object({
        patientId: z.string().min(1).optional(),
        providerId: z.string().optional().nullable(),
        visitId: z.string().optional().nullable(),
        status: z.nativeEnum(CardiologyProcedureStatus).optional(),
        procedureDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid procedure date',
        }).optional(),
        type: z.string().optional().nullable(),
        indication: z.string().optional().nullable(),
        findings: z.string().optional().nullable(),
        complications: z.string().optional().nullable(),
        outcome: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
    }),
});

export const createCardiologyDeviceSchema = z.object({
    body: z.object({
        patientId: z.string().min(1, 'Patient ID is required'),
        providerId: z.string().optional().nullable(),
        deviceType: z.string().min(1, 'Device type is required'),
        manufacturer: z.string().optional().nullable(),
        model: z.string().optional().nullable(),
        serialNumber: z.string().optional().nullable(),
        implantDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid implant date',
        }).optional(),
        status: z.nativeEnum(CardiologyDeviceStatus).optional(),
        lastInterrogationDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid interrogation date',
        }).optional(),
        nextFollowUpDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid follow up date',
        }).optional(),
        batteryStatus: z.string().optional().nullable(),
        settings: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
    }),
});

export const updateCardiologyDeviceSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Device ID is required'),
    }),
    body: z.object({
        patientId: z.string().min(1).optional(),
        providerId: z.string().optional().nullable(),
        deviceType: z.string().min(1).optional(),
        manufacturer: z.string().optional().nullable(),
        model: z.string().optional().nullable(),
        serialNumber: z.string().optional().nullable(),
        implantDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid implant date',
        }).optional(),
        status: z.nativeEnum(CardiologyDeviceStatus).optional(),
        lastInterrogationDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid interrogation date',
        }).optional(),
        nextFollowUpDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid follow up date',
        }).optional(),
        batteryStatus: z.string().optional().nullable(),
        settings: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
    }),
});

export const createCardiologyMedicationSchema = z.object({
    body: z.object({
        patientId: z.string().min(1, 'Patient ID is required'),
        providerId: z.string().optional().nullable(),
        medicationName: z.string().min(1, 'Medication name is required'),
        dose: z.string().optional().nullable(),
        route: z.nativeEnum(CardiologyMedicationRoute).optional(),
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
        indication: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
    }),
});

export const updateCardiologyMedicationSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Medication order ID is required'),
    }),
    body: z.object({
        patientId: z.string().min(1).optional(),
        providerId: z.string().optional().nullable(),
        medicationName: z.string().min(1).optional(),
        dose: z.string().optional().nullable(),
        route: z.nativeEnum(CardiologyMedicationRoute).optional(),
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
        indication: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
    }),
});

export const createCardiologyLabSchema = z.object({
    body: z.object({
        patientId: z.string().min(1, 'Patient ID is required'),
        collectedAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid collection date',
        }),
        troponin: z.number().optional(),
        bnp: z.number().optional(),
        ntProBnp: z.number().optional(),
        ckmb: z.number().optional(),
        totalCholesterol: z.number().optional(),
        ldl: z.number().optional(),
        hdl: z.number().optional(),
        triglycerides: z.number().optional(),
        crp: z.number().optional(),
        inr: z.number().optional(),
        notes: z.string().optional().nullable(),
    }),
});

export const updateCardiologyLabSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Lab result ID is required'),
    }),
    body: z.object({
        patientId: z.string().min(1).optional(),
        collectedAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid collection date',
        }).optional(),
        troponin: z.number().optional(),
        bnp: z.number().optional(),
        ntProBnp: z.number().optional(),
        ckmb: z.number().optional(),
        totalCholesterol: z.number().optional(),
        ldl: z.number().optional(),
        hdl: z.number().optional(),
        triglycerides: z.number().optional(),
        crp: z.number().optional(),
        inr: z.number().optional(),
        notes: z.string().optional().nullable(),
    }),
});

// Nephrology Schemas
export const createNephrologyVisitSchema = z.object({
    body: z.object({
        patientId: z.string().min(1, 'Patient ID is required'),
        providerId: z.string().min(1, 'Provider ID is required'),
        status: z.nativeEnum(NephrologyVisitStatus).optional(),
        visitDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid visit date',
        }),
        reason: z.string().optional().nullable(),
        symptoms: z.string().optional().nullable(),
        ckdStage: z.nativeEnum(CkdStage).optional(),
        egfr: z.number().optional(),
        bpSystolic: z.number().optional(),
        bpDiastolic: z.number().optional(),
        diagnosis: z.string().optional().nullable(),
        assessment: z.string().optional().nullable(),
        plan: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
    }),
});

export const updateNephrologyVisitSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Visit ID is required'),
    }),
    body: z.object({
        patientId: z.string().min(1).optional(),
        providerId: z.string().min(1).optional(),
        status: z.nativeEnum(NephrologyVisitStatus).optional(),
        visitDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid visit date',
        }).optional(),
        reason: z.string().optional().nullable(),
        symptoms: z.string().optional().nullable(),
        ckdStage: z.nativeEnum(CkdStage).optional(),
        egfr: z.number().optional(),
        bpSystolic: z.number().optional(),
        bpDiastolic: z.number().optional(),
        diagnosis: z.string().optional().nullable(),
        assessment: z.string().optional().nullable(),
        plan: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
    }),
});

export const createNephrologyLabSchema = z.object({
    body: z.object({
        patientId: z.string().min(1, 'Patient ID is required'),
        collectedAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid collection date',
        }),
        creatinine: z.number().optional(),
        bun: z.number().optional(),
        egfr: z.number().optional(),
        potassium: z.number().optional(),
        sodium: z.number().optional(),
        chloride: z.number().optional(),
        bicarbonate: z.number().optional(),
        calcium: z.number().optional(),
        phosphorus: z.number().optional(),
        albumin: z.number().optional(),
        hemoglobin: z.number().optional(),
        pth: z.number().optional(),
        vitaminD: z.number().optional(),
        uricAcid: z.number().optional(),
        urineProtein: z.number().optional(),
        urineAlbumin: z.number().optional(),
        urineCreatinine: z.number().optional(),
        uacr: z.number().optional(),
        upcr: z.number().optional(),
        notes: z.string().optional().nullable(),
    }),
});

export const updateNephrologyLabSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Lab result ID is required'),
    }),
    body: z.object({
        patientId: z.string().min(1).optional(),
        collectedAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid collection date',
        }).optional(),
        creatinine: z.number().optional(),
        bun: z.number().optional(),
        egfr: z.number().optional(),
        potassium: z.number().optional(),
        sodium: z.number().optional(),
        chloride: z.number().optional(),
        bicarbonate: z.number().optional(),
        calcium: z.number().optional(),
        phosphorus: z.number().optional(),
        albumin: z.number().optional(),
        hemoglobin: z.number().optional(),
        pth: z.number().optional(),
        vitaminD: z.number().optional(),
        uricAcid: z.number().optional(),
        urineProtein: z.number().optional(),
        urineAlbumin: z.number().optional(),
        urineCreatinine: z.number().optional(),
        uacr: z.number().optional(),
        upcr: z.number().optional(),
        notes: z.string().optional().nullable(),
    }),
});

export const createNephrologyImagingSchema = z.object({
    body: z.object({
        patientId: z.string().min(1, 'Patient ID is required'),
        providerId: z.string().optional().nullable(),
        visitId: z.string().optional().nullable(),
        status: z.nativeEnum(NephrologyTestStatus).optional(),
        performedAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid performed time',
        }),
        modality: z.nativeEnum(NephrologyImagingModality),
        studyType: z.string().optional().nullable(),
        findings: z.string().optional().nullable(),
        impression: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
    }),
});

export const updateNephrologyImagingSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Imaging ID is required'),
    }),
    body: z.object({
        patientId: z.string().min(1).optional(),
        providerId: z.string().optional().nullable(),
        visitId: z.string().optional().nullable(),
        status: z.nativeEnum(NephrologyTestStatus).optional(),
        performedAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid performed time',
        }).optional(),
        modality: z.nativeEnum(NephrologyImagingModality).optional(),
        studyType: z.string().optional().nullable(),
        findings: z.string().optional().nullable(),
        impression: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
    }),
});

export const createNephrologyBiopsySchema = z.object({
    body: z.object({
        patientId: z.string().min(1, 'Patient ID is required'),
        providerId: z.string().optional().nullable(),
        visitId: z.string().optional().nullable(),
        status: z.nativeEnum(NephrologyProcedureStatus).optional(),
        performedAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid procedure date',
        }),
        indication: z.string().optional().nullable(),
        specimenType: z.string().optional().nullable(),
        pathologySummary: z.string().optional().nullable(),
        complications: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
    }),
});

export const updateNephrologyBiopsySchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Biopsy ID is required'),
    }),
    body: z.object({
        patientId: z.string().min(1).optional(),
        providerId: z.string().optional().nullable(),
        visitId: z.string().optional().nullable(),
        status: z.nativeEnum(NephrologyProcedureStatus).optional(),
        performedAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid procedure date',
        }).optional(),
        indication: z.string().optional().nullable(),
        specimenType: z.string().optional().nullable(),
        pathologySummary: z.string().optional().nullable(),
        complications: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
    }),
});

export const createNephrologyMedicationSchema = z.object({
    body: z.object({
        patientId: z.string().min(1, 'Patient ID is required'),
        providerId: z.string().optional().nullable(),
        medicationName: z.string().min(1, 'Medication name is required'),
        dose: z.string().optional().nullable(),
        route: z.nativeEnum(NephrologyMedicationRoute).optional(),
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
        indication: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
    }),
});

export const updateNephrologyMedicationSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Medication order ID is required'),
    }),
    body: z.object({
        patientId: z.string().min(1).optional(),
        providerId: z.string().optional().nullable(),
        medicationName: z.string().min(1).optional(),
        dose: z.string().optional().nullable(),
        route: z.nativeEnum(NephrologyMedicationRoute).optional(),
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
        indication: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
    }),
});

// Neurology Schemas
export const createNeurologyVisitSchema = z.object({
    body: z.object({
        patientId: z.string().min(1, 'Patient ID is required'),
        providerId: z.string().min(1, 'Provider ID is required'),
        status: z.nativeEnum(NeurologyVisitStatus).optional(),
        visitDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid visit date',
        }),
        reason: z.string().optional().nullable(),
        symptoms: z.string().optional().nullable(),
        mentalStatus: z.string().optional().nullable(),
        cranialNerves: z.string().optional().nullable(),
        motorExam: z.string().optional().nullable(),
        sensoryExam: z.string().optional().nullable(),
        reflexes: z.string().optional().nullable(),
        coordination: z.string().optional().nullable(),
        gait: z.string().optional().nullable(),
        speech: z.string().optional().nullable(),
        nihssScore: z.number().optional(),
        gcsScore: z.number().optional(),
        diagnosis: z.string().optional().nullable(),
        assessment: z.string().optional().nullable(),
        plan: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
    }),
});

export const updateNeurologyVisitSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Visit ID is required'),
    }),
    body: z.object({
        patientId: z.string().min(1).optional(),
        providerId: z.string().min(1).optional(),
        status: z.nativeEnum(NeurologyVisitStatus).optional(),
        visitDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid visit date',
        }).optional(),
        reason: z.string().optional().nullable(),
        symptoms: z.string().optional().nullable(),
        mentalStatus: z.string().optional().nullable(),
        cranialNerves: z.string().optional().nullable(),
        motorExam: z.string().optional().nullable(),
        sensoryExam: z.string().optional().nullable(),
        reflexes: z.string().optional().nullable(),
        coordination: z.string().optional().nullable(),
        gait: z.string().optional().nullable(),
        speech: z.string().optional().nullable(),
        nihssScore: z.number().optional(),
        gcsScore: z.number().optional(),
        diagnosis: z.string().optional().nullable(),
        assessment: z.string().optional().nullable(),
        plan: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
    }),
});

// Encounter Schemas
export const createEncounterSchema = z.object({
    body: z.object({
        patientId: z.string().min(1, 'Patient ID is required'),
        providerId: z.string().min(1, 'Provider ID is required'),
        appointmentId: z.string().optional().nullable(),
        admissionId: z.string().optional().nullable(),
        status: z.nativeEnum(EncounterStatus).optional(),
        reasonForVisit: z.string().optional().nullable(),
        diagnosis: z.string().optional().nullable(),
        assessment: z.string().optional().nullable(),
        plan: z.string().optional().nullable(),
        startTime: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid start time',
        }).optional(),
        endTime: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid end time',
        }).optional(),
        notes: z.string().optional().nullable(),
    }),
});

export const updateEncounterSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Encounter ID is required'),
    }),
    body: z.object({
        patientId: z.string().min(1).optional(),
        providerId: z.string().min(1).optional(),
        appointmentId: z.string().optional().nullable(),
        admissionId: z.string().optional().nullable(),
        status: z.nativeEnum(EncounterStatus).optional(),
        reasonForVisit: z.string().optional().nullable(),
        diagnosis: z.string().optional().nullable(),
        assessment: z.string().optional().nullable(),
        plan: z.string().optional().nullable(),
        startTime: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid start time',
        }).optional(),
        endTime: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid end time',
        }).optional(),
        notes: z.string().optional().nullable(),
    }),
});

// Clinical Order Schemas
export const createClinicalOrderSchema = z.object({
    body: z.object({
        patientId: z.string().min(1, 'Patient ID is required'),
        providerId: z.string().min(1, 'Provider ID is required'),
        encounterId: z.string().optional().nullable(),
        orderType: z.nativeEnum(OrderType),
        status: z.nativeEnum(OrderStatus).optional(),
        priority: z.nativeEnum(OrderPriority).optional(),
        orderedAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid order time',
        }).optional(),
        orderName: z.string().min(1, 'Order name is required'),
        description: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
    }),
});

export const updateClinicalOrderSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Order ID is required'),
    }),
    body: z.object({
        patientId: z.string().min(1).optional(),
        providerId: z.string().min(1).optional(),
        encounterId: z.string().optional().nullable(),
        orderType: z.nativeEnum(OrderType).optional(),
        status: z.nativeEnum(OrderStatus).optional(),
        priority: z.nativeEnum(OrderPriority).optional(),
        orderedAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid order time',
        }).optional(),
        orderName: z.string().min(1).optional(),
        description: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
    }),
});

// Clinical Result Schemas
export const createClinicalResultSchema = z.object({
    body: z.object({
        orderId: z.string().min(1, 'Order ID is required'),
        patientId: z.string().min(1, 'Patient ID is required'),
        reportedAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid report time',
        }).optional(),
        resultName: z.string().min(1, 'Result name is required'),
        value: z.string().optional().nullable(),
        unit: z.string().optional().nullable(),
        referenceRange: z.string().optional().nullable(),
        status: z.nativeEnum(ResultStatus).optional(),
        flag: z.nativeEnum(ResultFlag).optional(),
        notes: z.string().optional().nullable(),
    }),
});

export const updateClinicalResultSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Result ID is required'),
    }),
    body: z.object({
        orderId: z.string().min(1).optional(),
        patientId: z.string().min(1).optional(),
        reportedAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid report time',
        }).optional(),
        resultName: z.string().min(1).optional(),
        value: z.string().optional().nullable(),
        unit: z.string().optional().nullable(),
        referenceRange: z.string().optional().nullable(),
        status: z.nativeEnum(ResultStatus).optional(),
        flag: z.nativeEnum(ResultFlag).optional(),
        notes: z.string().optional().nullable(),
    }),
});

// Medication Schemas
export const createMedicationOrderSchema = z.object({
    body: z.object({
        patientId: z.string().min(1, 'Patient ID is required'),
        providerId: z.string().optional().nullable(),
        encounterId: z.string().optional().nullable(),
        status: z.nativeEnum(MedicationOrderStatus).optional(),
        medicationName: z.string().min(1, 'Medication name is required'),
        dose: z.string().optional().nullable(),
        route: z.nativeEnum(MedicationRoute).optional(),
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
        indication: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
    }),
});

export const updateMedicationOrderSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Medication order ID is required'),
    }),
    body: z.object({
        patientId: z.string().min(1).optional(),
        providerId: z.string().optional().nullable(),
        encounterId: z.string().optional().nullable(),
        status: z.nativeEnum(MedicationOrderStatus).optional(),
        medicationName: z.string().min(1).optional(),
        dose: z.string().optional().nullable(),
        route: z.nativeEnum(MedicationRoute).optional(),
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
        indication: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
    }),
});

export const createMedicationAdministrationSchema = z.object({
    body: z.object({
        medicationOrderId: z.string().min(1, 'Medication order ID is required'),
        patientId: z.string().min(1, 'Patient ID is required'),
        administeredById: z.string().optional().nullable(),
        administeredAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid administration time',
        }).optional(),
        doseGiven: z.string().optional().nullable(),
        status: z.nativeEnum(MedicationAdministrationStatus).optional(),
        notes: z.string().optional().nullable(),
    }),
});

export const updateMedicationAdministrationSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Administration ID is required'),
    }),
    body: z.object({
        medicationOrderId: z.string().min(1).optional(),
        patientId: z.string().min(1).optional(),
        administeredById: z.string().optional().nullable(),
        administeredAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid administration time',
        }).optional(),
        doseGiven: z.string().optional().nullable(),
        status: z.nativeEnum(MedicationAdministrationStatus).optional(),
        notes: z.string().optional().nullable(),
    }),
});

// Admissions Schemas
export const createWardSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Ward name is required'),
        departmentId: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
        isActive: z.boolean().optional(),
    }),
});

export const updateWardSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Ward ID is required'),
    }),
    body: z.object({
        name: z.string().min(1).optional(),
        departmentId: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
        isActive: z.boolean().optional(),
    }),
});

export const createBedSchema = z.object({
    body: z.object({
        wardId: z.string().min(1, 'Ward ID is required'),
        roomNumber: z.string().optional().nullable(),
        bedLabel: z.string().min(1, 'Bed label is required'),
        status: z.nativeEnum(BedStatus).optional(),
        isActive: z.boolean().optional(),
        notes: z.string().optional().nullable(),
    }),
});

export const updateBedSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Bed ID is required'),
    }),
    body: z.object({
        wardId: z.string().min(1).optional(),
        roomNumber: z.string().optional().nullable(),
        bedLabel: z.string().min(1).optional(),
        status: z.nativeEnum(BedStatus).optional(),
        isActive: z.boolean().optional(),
        notes: z.string().optional().nullable(),
    }),
});

export const createAdmissionSchema = z.object({
    body: z.object({
        patientId: z.string().min(1, 'Patient ID is required'),
        providerId: z.string().min(1, 'Provider ID is required'),
        wardId: z.string().optional().nullable(),
        bedId: z.string().optional().nullable(),
        departmentId: z.string().optional().nullable(),
        status: z.nativeEnum(AdmissionStatus).optional(),
        admitDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid admit date',
        }).optional(),
        dischargeDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid discharge date',
        }).optional(),
        reason: z.string().optional().nullable(),
        diagnosis: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
    }),
});

export const updateAdmissionSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Admission ID is required'),
    }),
    body: z.object({
        patientId: z.string().min(1).optional(),
        providerId: z.string().min(1).optional(),
        wardId: z.string().optional().nullable(),
        bedId: z.string().optional().nullable(),
        departmentId: z.string().optional().nullable(),
        status: z.nativeEnum(AdmissionStatus).optional(),
        admitDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid admit date',
        }).optional(),
        dischargeDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid discharge date',
        }).optional(),
        reason: z.string().optional().nullable(),
        diagnosis: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
    }),
});

// Billing Schemas
export const createInvoiceSchema = z.object({
    body: z.object({
        patientId: z.string().min(1, 'Patient ID is required'),
        encounterId: z.string().optional().nullable(),
        status: z.nativeEnum(InvoiceStatus).optional(),
        totalAmount: z.number().optional(),
        dueDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid due date',
        }).optional(),
        notes: z.string().optional().nullable(),
        items: z.array(z.object({
            description: z.string().min(1, 'Item description is required'),
            quantity: z.number().int().min(1).optional(),
            unitPrice: z.number(),
        })).optional(),
    }),
});

export const updateInvoiceSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Invoice ID is required'),
    }),
    body: z.object({
        patientId: z.string().min(1).optional(),
        encounterId: z.string().optional().nullable(),
        status: z.nativeEnum(InvoiceStatus).optional(),
        totalAmount: z.number().optional(),
        dueDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid due date',
        }).optional(),
        notes: z.string().optional().nullable(),
        items: z.array(z.object({
            description: z.string().min(1, 'Item description is required'),
            quantity: z.number().int().min(1).optional(),
            unitPrice: z.number(),
        })).optional(),
    }),
});

export const createPaymentSchema = z.object({
    body: z.object({
        invoiceId: z.string().min(1, 'Invoice ID is required'),
        patientId: z.string().min(1, 'Patient ID is required'),
        amount: z.number().min(0.01, 'Amount is required'),
        method: z.nativeEnum(PaymentMethod),
        paidAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid payment date',
        }).optional(),
        reference: z.string().optional().nullable(),
        receivedById: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
    }),
});

export const updatePaymentSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Payment ID is required'),
    }),
    body: z.object({
        invoiceId: z.string().min(1).optional(),
        patientId: z.string().min(1).optional(),
        amount: z.number().optional(),
        method: z.nativeEnum(PaymentMethod).optional(),
        paidAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid payment date',
        }).optional(),
        reference: z.string().optional().nullable(),
        receivedById: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
    }),
});

export const createClaimSchema = z.object({
    body: z.object({
        invoiceId: z.string().min(1, 'Invoice ID is required'),
        patientId: z.string().min(1, 'Patient ID is required'),
        payerName: z.string().min(1, 'Payer name is required'),
        status: z.nativeEnum(ClaimStatus).optional(),
        submittedAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid submitted date',
        }).optional(),
        resolvedAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid resolved date',
        }).optional(),
        notes: z.string().optional().nullable(),
    }),
});

export const updateClaimSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Claim ID is required'),
    }),
    body: z.object({
        invoiceId: z.string().min(1).optional(),
        patientId: z.string().min(1).optional(),
        payerName: z.string().min(1).optional(),
        status: z.nativeEnum(ClaimStatus).optional(),
        submittedAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid submitted date',
        }).optional(),
        resolvedAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid resolved date',
        }).optional(),
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
export type CreateCardiologyVisitInput = z.infer<typeof createCardiologyVisitSchema>['body'];
export type UpdateCardiologyVisitInput = z.infer<typeof updateCardiologyVisitSchema>['body'];
export type CreateCardiologyEcgInput = z.infer<typeof createCardiologyEcgSchema>['body'];
export type UpdateCardiologyEcgInput = z.infer<typeof updateCardiologyEcgSchema>['body'];
export type CreateCardiologyEchoInput = z.infer<typeof createCardiologyEchoSchema>['body'];
export type UpdateCardiologyEchoInput = z.infer<typeof updateCardiologyEchoSchema>['body'];
export type CreateCardiologyStressTestInput = z.infer<typeof createCardiologyStressTestSchema>['body'];
export type UpdateCardiologyStressTestInput = z.infer<typeof updateCardiologyStressTestSchema>['body'];
export type CreateCardiologyProcedureInput = z.infer<typeof createCardiologyProcedureSchema>['body'];
export type UpdateCardiologyProcedureInput = z.infer<typeof updateCardiologyProcedureSchema>['body'];
export type CreateCardiologyDeviceInput = z.infer<typeof createCardiologyDeviceSchema>['body'];
export type UpdateCardiologyDeviceInput = z.infer<typeof updateCardiologyDeviceSchema>['body'];
export type CreateCardiologyMedicationInput = z.infer<typeof createCardiologyMedicationSchema>['body'];
export type UpdateCardiologyMedicationInput = z.infer<typeof updateCardiologyMedicationSchema>['body'];
export type CreateCardiologyLabInput = z.infer<typeof createCardiologyLabSchema>['body'];
export type UpdateCardiologyLabInput = z.infer<typeof updateCardiologyLabSchema>['body'];
export type CreateNephrologyVisitInput = z.infer<typeof createNephrologyVisitSchema>['body'];
export type UpdateNephrologyVisitInput = z.infer<typeof updateNephrologyVisitSchema>['body'];
export type CreateNephrologyLabInput = z.infer<typeof createNephrologyLabSchema>['body'];
export type UpdateNephrologyLabInput = z.infer<typeof updateNephrologyLabSchema>['body'];
export type CreateNephrologyImagingInput = z.infer<typeof createNephrologyImagingSchema>['body'];
export type UpdateNephrologyImagingInput = z.infer<typeof updateNephrologyImagingSchema>['body'];
export type CreateNephrologyBiopsyInput = z.infer<typeof createNephrologyBiopsySchema>['body'];
export type UpdateNephrologyBiopsyInput = z.infer<typeof updateNephrologyBiopsySchema>['body'];
export type CreateNephrologyMedicationInput = z.infer<typeof createNephrologyMedicationSchema>['body'];
export type UpdateNephrologyMedicationInput = z.infer<typeof updateNephrologyMedicationSchema>['body'];
export type CreateNeurologyVisitInput = z.infer<typeof createNeurologyVisitSchema>['body'];
export type UpdateNeurologyVisitInput = z.infer<typeof updateNeurologyVisitSchema>['body'];
export type CreateEncounterInput = z.infer<typeof createEncounterSchema>['body'];
export type UpdateEncounterInput = z.infer<typeof updateEncounterSchema>['body'];
export type CreateClinicalOrderInput = z.infer<typeof createClinicalOrderSchema>['body'];
export type UpdateClinicalOrderInput = z.infer<typeof updateClinicalOrderSchema>['body'];
export type CreateClinicalResultInput = z.infer<typeof createClinicalResultSchema>['body'];
export type UpdateClinicalResultInput = z.infer<typeof updateClinicalResultSchema>['body'];
export type CreateMedicationOrderInput = z.infer<typeof createMedicationOrderSchema>['body'];
export type UpdateMedicationOrderInput = z.infer<typeof updateMedicationOrderSchema>['body'];
export type CreateMedicationAdministrationInput = z.infer<typeof createMedicationAdministrationSchema>['body'];
export type UpdateMedicationAdministrationInput = z.infer<typeof updateMedicationAdministrationSchema>['body'];
export type CreateWardInput = z.infer<typeof createWardSchema>['body'];
export type UpdateWardInput = z.infer<typeof updateWardSchema>['body'];
export type CreateBedInput = z.infer<typeof createBedSchema>['body'];
export type UpdateBedInput = z.infer<typeof updateBedSchema>['body'];
export type CreateAdmissionInput = z.infer<typeof createAdmissionSchema>['body'];
export type UpdateAdmissionInput = z.infer<typeof updateAdmissionSchema>['body'];
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>['body'];
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>['body'];
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>['body'];
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>['body'];
export type CreateClaimInput = z.infer<typeof createClaimSchema>['body'];
export type UpdateClaimInput = z.infer<typeof updateClaimSchema>['body'];
