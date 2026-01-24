import { z } from 'zod';
import { Role, Gender, BloodType } from '@prisma/client';

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

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type CreatePatientInput = z.infer<typeof createPatientSchema>['body'];
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>['body'];
export type CreateMedicalHistoryInput = z.infer<typeof createMedicalHistorySchema>['body'];
