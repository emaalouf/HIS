export type Role = 'ADMIN' | 'DOCTOR' | 'NURSE' | 'RECEPTIONIST';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type BloodType = 'A_POSITIVE' | 'A_NEGATIVE' | 'B_POSITIVE' | 'B_NEGATIVE' | 'AB_POSITIVE' | 'AB_NEGATIVE' | 'O_POSITIVE' | 'O_NEGATIVE' | 'UNKNOWN';
export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'CHECKED_IN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
export type DialysisStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    createdAt?: string;
}

export interface Permission {
    id: string;
    name: string;
    description?: string;
    key?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface AccessRole {
    id: string;
    name: string;
    description?: string;
    isActive?: boolean;
    permissions?: Permission[];
    createdAt?: string;
    updatedAt?: string;
}

export interface Specialty {
    id: string;
    name: string;
    description?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreatePermissionRequest {
    name: string;
    description?: string;
    key?: string;
}

export interface CreateRoleRequest {
    name: string;
    description?: string;
    isActive?: boolean;
    permissionIds?: string[];
}

export interface CreateSpecialtyRequest {
    name: string;
    description?: string;
    isActive?: boolean;
}

export interface Provider {
    id: string;
    firstName: string;
    lastName: string;
    role: Role;
    email?: string;
    phone?: string;
    specialty?: string;
    department?: string;
    licenseNumber?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
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

export interface CreateProviderRequest {
    firstName: string;
    lastName: string;
    role: Role;
    email?: string;
    phone?: string;
    specialty?: string;
    department?: string;
    licenseNumber?: string;
    isActive?: boolean;
}

export interface CreateMedicalHistoryRequest {
    diagnosis: string;
    treatment?: string;
    notes?: string;
    visitDate: string;
}

export interface VisitType {
    id: string;
    name: string;
    description?: string | null;
    durationMinutes: number;
    isTelehealth: boolean;
    color?: string | null;
}

export interface Location {
    id: string;
    name: string;
    type?: string | null;
}

export interface Appointment {
    id: string;
    patientId: string;
    providerId: string;
    visitTypeId?: string | null;
    locationId?: string | null;
    startTime: string;
    endTime: string;
    status: AppointmentStatus;
    reason?: string | null;
    notes?: string | null;
    cancellationReason?: string | null;
    patient?: {
        id: string;
        mrn: string;
        firstName: string;
        lastName: string;
        phone?: string;
    };
    provider?: {
        id: string;
        firstName: string;
        lastName: string;
        role: Role;
    };
    visitType?: VisitType | null;
    location?: Location | null;
}

export interface DialysisSession {
    id: string;
    patientId: string;
    providerId: string;
    status: DialysisStatus;
    startTime: string;
    endTime: string;
    machineNumber?: string;
    accessType?: string;
    dialyzer?: string;
    dialysate?: string;
    bloodFlowRate?: number;
    dialysateFlowRate?: number;
    ultrafiltrationVolume?: number;
    weightPre?: number;
    weightPost?: number;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
    patient?: {
        id: string;
        mrn: string;
        firstName: string;
        lastName: string;
        phone?: string;
    };
    provider?: {
        id: string;
        firstName: string;
        lastName: string;
        role: Role;
    };
}

export interface CreateDialysisSessionRequest {
    patientId: string;
    providerId: string;
    status?: DialysisStatus;
    startTime: string;
    endTime: string;
    machineNumber?: string;
    accessType?: string;
    dialyzer?: string;
    dialysate?: string;
    bloodFlowRate?: number;
    dialysateFlowRate?: number;
    ultrafiltrationVolume?: number;
    weightPre?: number;
    weightPost?: number;
    notes?: string;
}

export type DialysisStationStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'OUT_OF_SERVICE';
export type DialysisScheduleRecurrence = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type DialysisMedicationRoute = 'IV' | 'PO' | 'IM' | 'SC' | 'OTHER';

export interface DialysisPrescription {
    id: string;
    patientId: string;
    providerId?: string;
    dryWeight?: number;
    targetUltrafiltration?: number;
    durationMinutes?: number;
    dialyzer?: string;
    dialysate?: string;
    bloodFlowRate?: number;
    dialysateFlowRate?: number;
    accessType?: string;
    frequency?: string;
    isActive?: boolean;
    notes?: string;
    startDate?: string;
    endDate?: string;
    createdAt?: string;
    updatedAt?: string;
    patient?: {
        id: string;
        mrn: string;
        firstName: string;
        lastName: string;
    };
    provider?: {
        id: string;
        firstName: string;
        lastName: string;
        role: Role;
    };
}

export interface CreateDialysisPrescriptionRequest {
    patientId: string;
    providerId?: string;
    dryWeight?: number;
    targetUltrafiltration?: number;
    durationMinutes?: number;
    dialyzer?: string;
    dialysate?: string;
    bloodFlowRate?: number;
    dialysateFlowRate?: number;
    accessType?: string;
    frequency?: string;
    isActive?: boolean;
    notes?: string;
    startDate?: string;
    endDate?: string;
}

export interface DialysisFlowsheetEntry {
    id: string;
    sessionId: string;
    recordedAt: string;
    bpSystolic?: number;
    bpDiastolic?: number;
    heartRate?: number;
    temperature?: number;
    oxygenSaturation?: number;
    bloodFlowRate?: number;
    dialysateFlowRate?: number;
    ultrafiltrationVolume?: number;
    arterialPressure?: number;
    venousPressure?: number;
    transmembranePressure?: number;
    alarms?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateDialysisFlowsheetEntryRequest {
    sessionId: string;
    recordedAt: string;
    bpSystolic?: number;
    bpDiastolic?: number;
    heartRate?: number;
    temperature?: number;
    oxygenSaturation?: number;
    bloodFlowRate?: number;
    dialysateFlowRate?: number;
    ultrafiltrationVolume?: number;
    arterialPressure?: number;
    venousPressure?: number;
    transmembranePressure?: number;
    alarms?: string;
    notes?: string;
}

export interface DialysisStation {
    id: string;
    name: string;
    room?: string;
    machineNumber?: string;
    status: DialysisStationStatus;
    lastServiceDate?: string;
    nextServiceDate?: string;
    notes?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateDialysisStationRequest {
    name: string;
    room?: string;
    machineNumber?: string;
    status?: DialysisStationStatus;
    lastServiceDate?: string;
    nextServiceDate?: string;
    notes?: string;
    isActive?: boolean;
}

export interface DialysisSchedule {
    id: string;
    patientId: string;
    providerId?: string;
    stationId?: string;
    startTime: string;
    durationMinutes: number;
    recurrence: DialysisScheduleRecurrence;
    daysOfWeek?: string[];
    endDate?: string;
    isActive?: boolean;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
    patient?: {
        id: string;
        mrn: string;
        firstName: string;
        lastName: string;
    };
    provider?: {
        id: string;
        firstName: string;
        lastName: string;
        role: Role;
    };
    station?: {
        id: string;
        name: string;
        room?: string;
    };
}

export interface CreateDialysisScheduleRequest {
    patientId: string;
    providerId?: string;
    stationId?: string;
    startTime: string;
    durationMinutes: number;
    recurrence?: DialysisScheduleRecurrence;
    daysOfWeek?: string[];
    endDate?: string;
    isActive?: boolean;
    notes?: string;
}

export interface DialysisLabResult {
    id: string;
    patientId: string;
    collectedAt: string;
    ktv?: number;
    urr?: number;
    hemoglobin?: number;
    potassium?: number;
    sodium?: number;
    calcium?: number;
    phosphorus?: number;
    bicarbonate?: number;
    albumin?: number;
    creatinine?: number;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
    patient?: {
        id: string;
        mrn: string;
        firstName: string;
        lastName: string;
    };
}

export interface CreateDialysisLabResultRequest {
    patientId: string;
    collectedAt: string;
    ktv?: number;
    urr?: number;
    hemoglobin?: number;
    potassium?: number;
    sodium?: number;
    calcium?: number;
    phosphorus?: number;
    bicarbonate?: number;
    albumin?: number;
    creatinine?: number;
    notes?: string;
}

export interface DialysisMedicationOrder {
    id: string;
    patientId: string;
    medicationName: string;
    dose?: string;
    route?: DialysisMedicationRoute;
    frequency?: string;
    startDate?: string;
    endDate?: string;
    lastAdministeredAt?: string;
    isActive?: boolean;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
    patient?: {
        id: string;
        mrn: string;
        firstName: string;
        lastName: string;
    };
}

export interface CreateDialysisMedicationOrderRequest {
    patientId: string;
    medicationName: string;
    dose?: string;
    route?: DialysisMedicationRoute;
    frequency?: string;
    startDate?: string;
    endDate?: string;
    lastAdministeredAt?: string;
    isActive?: boolean;
    notes?: string;
}

export interface DialysisReportSummary {
    totalSessions?: number;
    completedSessions?: number;
    cancelledSessions?: number;
    averageDurationMinutes?: number;
    averageKtv?: number;
    averageUrr?: number;
    activePatients?: number;
    chairUtilizationPercent?: number;
}

export type CardiologyVisitStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type CardiologyTestStatus = 'ORDERED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type CardiologyProcedureStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type CardiologyDeviceStatus = 'ACTIVE' | 'INACTIVE' | 'REMOVED';
export type CardiologyMedicationRoute = 'IV' | 'PO' | 'IM' | 'SC' | 'SL' | 'OTHER';

export interface CardiologyVisit {
    id: string;
    patientId: string;
    providerId: string;
    status: CardiologyVisitStatus;
    visitDate: string;
    reason?: string;
    symptoms?: string;
    diagnosis?: string;
    assessment?: string;
    plan?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
    patient?: {
        id: string;
        mrn: string;
        firstName: string;
        lastName: string;
        phone?: string;
    };
    provider?: {
        id: string;
        firstName: string;
        lastName: string;
        role: Role;
    };
}

export interface CreateCardiologyVisitRequest {
    patientId: string;
    providerId: string;
    status?: CardiologyVisitStatus;
    visitDate: string;
    reason?: string;
    symptoms?: string;
    diagnosis?: string;
    assessment?: string;
    plan?: string;
    notes?: string;
}

export interface CardiologyEcg {
    id: string;
    patientId: string;
    providerId?: string;
    visitId?: string;
    status: CardiologyTestStatus;
    recordedAt: string;
    type?: string;
    rhythm?: string;
    heartRate?: number;
    prInterval?: number;
    qrsDuration?: number;
    qtInterval?: number;
    qtc?: number;
    interpretation?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
    patient?: {
        id: string;
        mrn: string;
        firstName: string;
        lastName: string;
    };
    provider?: {
        id: string;
        firstName: string;
        lastName: string;
        role: Role;
    };
    visit?: {
        id: string;
        visitDate: string;
    };
}

export interface CreateCardiologyEcgRequest {
    patientId: string;
    providerId?: string;
    visitId?: string;
    status?: CardiologyTestStatus;
    recordedAt: string;
    type?: string;
    rhythm?: string;
    heartRate?: number;
    prInterval?: number;
    qrsDuration?: number;
    qtInterval?: number;
    qtc?: number;
    interpretation?: string;
    notes?: string;
}

export interface CardiologyEcho {
    id: string;
    patientId: string;
    providerId?: string;
    visitId?: string;
    status: CardiologyTestStatus;
    performedAt: string;
    type?: string;
    lvef?: number;
    lvEndDiastolicDia?: number;
    lvEndSystolicDia?: number;
    rvFunction?: string;
    valveFindings?: string;
    wallMotion?: string;
    pericardialEffusion?: boolean;
    summary?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
    patient?: {
        id: string;
        mrn: string;
        firstName: string;
        lastName: string;
    };
    provider?: {
        id: string;
        firstName: string;
        lastName: string;
        role: Role;
    };
    visit?: {
        id: string;
        visitDate: string;
    };
}

export interface CreateCardiologyEchoRequest {
    patientId: string;
    providerId?: string;
    visitId?: string;
    status?: CardiologyTestStatus;
    performedAt: string;
    type?: string;
    lvef?: number;
    lvEndDiastolicDia?: number;
    lvEndSystolicDia?: number;
    rvFunction?: string;
    valveFindings?: string;
    wallMotion?: string;
    pericardialEffusion?: boolean;
    summary?: string;
    notes?: string;
}

export interface CardiologyStressTest {
    id: string;
    patientId: string;
    providerId?: string;
    visitId?: string;
    status: CardiologyTestStatus;
    performedAt: string;
    type?: string;
    protocol?: string;
    durationMinutes?: number;
    mets?: number;
    maxHeartRate?: number;
    maxBpSystolic?: number;
    maxBpDiastolic?: number;
    symptoms?: string;
    result?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
    patient?: {
        id: string;
        mrn: string;
        firstName: string;
        lastName: string;
    };
    provider?: {
        id: string;
        firstName: string;
        lastName: string;
        role: Role;
    };
    visit?: {
        id: string;
        visitDate: string;
    };
}

export interface CreateCardiologyStressTestRequest {
    patientId: string;
    providerId?: string;
    visitId?: string;
    status?: CardiologyTestStatus;
    performedAt: string;
    type?: string;
    protocol?: string;
    durationMinutes?: number;
    mets?: number;
    maxHeartRate?: number;
    maxBpSystolic?: number;
    maxBpDiastolic?: number;
    symptoms?: string;
    result?: string;
    notes?: string;
}

export interface CardiologyProcedure {
    id: string;
    patientId: string;
    providerId?: string;
    visitId?: string;
    status: CardiologyProcedureStatus;
    procedureDate: string;
    type?: string;
    indication?: string;
    findings?: string;
    complications?: string;
    outcome?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
    patient?: {
        id: string;
        mrn: string;
        firstName: string;
        lastName: string;
    };
    provider?: {
        id: string;
        firstName: string;
        lastName: string;
        role: Role;
    };
    visit?: {
        id: string;
        visitDate: string;
    };
}

export interface CreateCardiologyProcedureRequest {
    patientId: string;
    providerId?: string;
    visitId?: string;
    status?: CardiologyProcedureStatus;
    procedureDate: string;
    type?: string;
    indication?: string;
    findings?: string;
    complications?: string;
    outcome?: string;
    notes?: string;
}

export interface CardiologyDevice {
    id: string;
    patientId: string;
    providerId?: string;
    deviceType: string;
    manufacturer?: string;
    model?: string;
    serialNumber?: string;
    implantDate?: string;
    status: CardiologyDeviceStatus;
    lastInterrogationDate?: string;
    nextFollowUpDate?: string;
    batteryStatus?: string;
    settings?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
    patient?: {
        id: string;
        mrn: string;
        firstName: string;
        lastName: string;
    };
    provider?: {
        id: string;
        firstName: string;
        lastName: string;
        role: Role;
    };
}

export interface CreateCardiologyDeviceRequest {
    patientId: string;
    providerId?: string;
    deviceType: string;
    manufacturer?: string;
    model?: string;
    serialNumber?: string;
    implantDate?: string;
    status?: CardiologyDeviceStatus;
    lastInterrogationDate?: string;
    nextFollowUpDate?: string;
    batteryStatus?: string;
    settings?: string;
    notes?: string;
}

export interface CardiologyMedicationOrder {
    id: string;
    patientId: string;
    providerId?: string;
    medicationName: string;
    dose?: string;
    route?: CardiologyMedicationRoute;
    frequency?: string;
    startDate?: string;
    endDate?: string;
    lastAdministeredAt?: string;
    isActive?: boolean;
    indication?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
    patient?: {
        id: string;
        mrn: string;
        firstName: string;
        lastName: string;
    };
    provider?: {
        id: string;
        firstName: string;
        lastName: string;
        role: Role;
    };
}

export interface CreateCardiologyMedicationOrderRequest {
    patientId: string;
    providerId?: string;
    medicationName: string;
    dose?: string;
    route?: CardiologyMedicationRoute;
    frequency?: string;
    startDate?: string;
    endDate?: string;
    lastAdministeredAt?: string;
    isActive?: boolean;
    indication?: string;
    notes?: string;
}

export interface CardiologyLabResult {
    id: string;
    patientId: string;
    collectedAt: string;
    troponin?: number;
    bnp?: number;
    ntProBnp?: number;
    ckmb?: number;
    totalCholesterol?: number;
    ldl?: number;
    hdl?: number;
    triglycerides?: number;
    crp?: number;
    inr?: number;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
    patient?: {
        id: string;
        mrn: string;
        firstName: string;
        lastName: string;
    };
}

export interface CreateCardiologyLabResultRequest {
    patientId: string;
    collectedAt: string;
    troponin?: number;
    bnp?: number;
    ntProBnp?: number;
    ckmb?: number;
    totalCholesterol?: number;
    ldl?: number;
    hdl?: number;
    triglycerides?: number;
    crp?: number;
    inr?: number;
    notes?: string;
}

export interface CardiologyReportSummary {
    totalVisits?: number;
    completedVisits?: number;
    cancelledVisits?: number;
    totalEcgs?: number;
    totalEchos?: number;
    totalStressTests?: number;
    totalProcedures?: number;
    completedProcedures?: number;
    averageLvef?: number;
    averageTroponin?: number;
    activeDevices?: number;
    activeMedications?: number;
}

export interface AppointmentMeta {
    visitTypes: VisitType[];
    locations: Location[];
    providers: Provider[];
}
