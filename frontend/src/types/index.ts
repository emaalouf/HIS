export type Role = 'ADMIN' | 'DOCTOR' | 'NURSE' | 'RECEPTIONIST';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type BloodType = 'A_POSITIVE' | 'A_NEGATIVE' | 'B_POSITIVE' | 'B_NEGATIVE' | 'AB_POSITIVE' | 'AB_NEGATIVE' | 'O_POSITIVE' | 'O_NEGATIVE' | 'UNKNOWN';

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    createdAt?: string;
}

export interface Patient {
    id: string;
    mrn: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: Gender;
    bloodType: BloodType;
    email?: string;
    phone: string;
    address?: string;
    city?: string;
    country?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelation?: string;
    allergies: string[];
    chronicConditions: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    medicalHistories?: MedicalHistory[];
    documents?: PatientDocument[];
}

export interface MedicalHistory {
    id: string;
    patientId: string;
    diagnosis: string;
    treatment?: string;
    notes?: string;
    visitDate: string;
    doctorId: string;
    doctor?: {
        id: string;
        firstName: string;
        lastName: string;
    };
    createdAt: string;
}

export interface PatientDocument {
    id: string;
    patientId: string;
    fileName: string;
    fileType: string;
    filePath: string;
    fileSize: number;
    uploadedById: string;
    uploadedBy?: {
        id: string;
        firstName: string;
        lastName: string;
    };
    uploadedAt: string;
}

export interface PatientStats {
    total: number;
    active: number;
    todayRegistrations: number;
}

export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

export interface CreatePatientRequest {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: Gender;
    bloodType?: BloodType;
    email?: string;
    phone: string;
    address?: string;
    city?: string;
    country?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelation?: string;
    allergies?: string[];
    chronicConditions?: string[];
}

export interface CreateMedicalHistoryRequest {
    diagnosis: string;
    treatment?: string;
    notes?: string;
    visitDate: string;
}
