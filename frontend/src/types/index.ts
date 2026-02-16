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

export interface Department {
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

export interface CreateDepartmentRequest {
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
    licenseNumber?: string;
    departmentId?: string | null;
    department?: {
        id: string;
        name: string;
    };
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
    email: string;
    phone?: string;
    specialty?: string;
    departmentId?: string;
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
    departmentId?: string | null;
    department?: {
        id: string;
        name: string;
    } | null;
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
        departmentId?: string | null;
        department?: {
            id: string;
            name: string;
        } | null;
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
export type ElectrophysiologyProcedureType = 'PACEMAKER_IMPLANT' | 'ICD_IMPLANT' | 'CRT_IMPLANT' | 'ABLATION' | 'ELECTROPHYSIOLOGY_STUDY' | 'LOOP_RECORDER_IMPLANT' | 'LEAD_EXTRACTION' | 'OTHER';
export type NYHAClass = 'CLASS_I' | 'CLASS_II' | 'CLASS_III' | 'CLASS_IV';
export type HeartFailureStage = 'STAGE_A' | 'STAGE_B' | 'STAGE_C' | 'STAGE_D';

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

export interface CreateCardiologyElectrophysiologyRequest {
    patientId: string;
    providerId?: string;
    visitId?: string;
    status?: CardiologyTestStatus;
    performedAt: string;
    procedureType: ElectrophysiologyProcedureType;
    indication?: string;
    arrhythmiaType?: string;
    deviceType?: string;
    manufacturer?: string;
    model?: string;
    serialNumber?: string;
    implantDate?: string;
    ablationTarget?: string;
    fluoroscopyTime?: number;
    complications?: string;
    outcome?: string;
    followUpDate?: string;
    notes?: string;
}

export interface CreateCardiologyHeartFailureRequest {
    patientId: string;
    providerId?: string;
    visitId?: string;
    status?: CardiologyTestStatus;
    assessmentDate: string;
    etiology?: string;
    nyhaClass?: NYHAClass;
    heartFailureStage?: HeartFailureStage;
    lvef?: number;
    symptoms?: string;
    medications?: string;
    mechanicalSupport?: string;
    transplantStatus?: string;
    implantableDevices?: string;
    rehospitalizations?: number;
    lastHospitalization?: string;
    bnp?: number;
    ntProBnp?: number;
    assessment?: string;
    plan?: string;
    nextFollowUpDate?: string;
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

export type NephrologyVisitStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type NephrologyTestStatus = 'ORDERED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type NephrologyProcedureStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type NephrologyMedicationRoute = 'IV' | 'PO' | 'IM' | 'SC' | 'SL' | 'OTHER';
export type CkdStage = 'STAGE_1' | 'STAGE_2' | 'STAGE_3A' | 'STAGE_3B' | 'STAGE_4' | 'STAGE_5' | 'ESRD';
export type NephrologyImagingModality = 'ULTRASOUND' | 'CT' | 'MRI' | 'XRAY' | 'NUCLEAR' | 'OTHER';

export interface NephrologyVisit {
    id: string;
    patientId: string;
    providerId: string;
    status: NephrologyVisitStatus;
    visitDate: string;
    reason?: string;
    symptoms?: string;
    ckdStage?: CkdStage;
    egfr?: number;
    bpSystolic?: number;
    bpDiastolic?: number;
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

export interface CreateNephrologyVisitRequest {
    patientId: string;
    providerId: string;
    status?: NephrologyVisitStatus;
    visitDate: string;
    reason?: string;
    symptoms?: string;
    ckdStage?: CkdStage;
    egfr?: number;
    bpSystolic?: number;
    bpDiastolic?: number;
    diagnosis?: string;
    assessment?: string;
    plan?: string;
    notes?: string;
}

export interface NephrologyLabResult {
    id: string;
    patientId: string;
    collectedAt: string;
    creatinine?: number;
    bun?: number;
    egfr?: number;
    potassium?: number;
    sodium?: number;
    chloride?: number;
    bicarbonate?: number;
    calcium?: number;
    phosphorus?: number;
    albumin?: number;
    hemoglobin?: number;
    pth?: number;
    vitaminD?: number;
    uricAcid?: number;
    urineProtein?: number;
    urineAlbumin?: number;
    urineCreatinine?: number;
    uacr?: number;
    upcr?: number;
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

export interface CreateNephrologyLabResultRequest {
    patientId: string;
    collectedAt: string;
    creatinine?: number;
    bun?: number;
    egfr?: number;
    potassium?: number;
    sodium?: number;
    chloride?: number;
    bicarbonate?: number;
    calcium?: number;
    phosphorus?: number;
    albumin?: number;
    hemoglobin?: number;
    pth?: number;
    vitaminD?: number;
    uricAcid?: number;
    urineProtein?: number;
    urineAlbumin?: number;
    urineCreatinine?: number;
    uacr?: number;
    upcr?: number;
    notes?: string;
}

export interface NephrologyImaging {
    id: string;
    patientId: string;
    providerId?: string;
    visitId?: string;
    status: NephrologyTestStatus;
    performedAt: string;
    modality: NephrologyImagingModality;
    studyType?: string;
    findings?: string;
    impression?: string;
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

export interface CreateNephrologyImagingRequest {
    patientId: string;
    providerId?: string;
    visitId?: string;
    status?: NephrologyTestStatus;
    performedAt: string;
    modality: NephrologyImagingModality;
    studyType?: string;
    findings?: string;
    impression?: string;
    notes?: string;
}

export interface NephrologyBiopsy {
    id: string;
    patientId: string;
    providerId?: string;
    visitId?: string;
    status: NephrologyProcedureStatus;
    performedAt: string;
    indication?: string;
    specimenType?: string;
    pathologySummary?: string;
    complications?: string;
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

export interface CreateNephrologyBiopsyRequest {
    patientId: string;
    providerId?: string;
    visitId?: string;
    status?: NephrologyProcedureStatus;
    performedAt: string;
    indication?: string;
    specimenType?: string;
    pathologySummary?: string;
    complications?: string;
    notes?: string;
}

export interface NephrologyMedicationOrder {
    id: string;
    patientId: string;
    providerId?: string;
    medicationName: string;
    dose?: string;
    route?: NephrologyMedicationRoute;
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

export interface CreateNephrologyMedicationOrderRequest {
    patientId: string;
    providerId?: string;
    medicationName: string;
    dose?: string;
    route?: NephrologyMedicationRoute;
    frequency?: string;
    startDate?: string;
    endDate?: string;
    lastAdministeredAt?: string;
    isActive?: boolean;
    indication?: string;
    notes?: string;
}

export interface NephrologyReportSummary {
    totalVisits?: number;
    completedVisits?: number;
    cancelledVisits?: number;
    totalImaging?: number;
    completedImaging?: number;
    totalBiopsies?: number;
    completedBiopsies?: number;
    averageEgfr?: number;
    averageCreatinine?: number;
    averageUacr?: number;
    activeMedications?: number;
}

export type EncounterStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type OrderType = 'LAB' | 'IMAGING' | 'MEDICATION' | 'PROCEDURE' | 'OTHER';
export type OrderStatus = 'ORDERED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type OrderPriority = 'ROUTINE' | 'URGENT' | 'STAT';
export type ResultStatus = 'PENDING' | 'FINAL' | 'AMENDED';
export type ResultFlag = 'NORMAL' | 'ABNORMAL' | 'CRITICAL';
export type MedicationOrderStatus = 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'DISCONTINUED';
export type MedicationRoute = 'IV' | 'PO' | 'IM' | 'SC' | 'SL' | 'INHALATION' | 'TOPICAL' | 'OTHER';
export type MedicationAdministrationStatus = 'GIVEN' | 'HELD' | 'REFUSED' | 'MISSED';
export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'SUBMITTED' | 'PARTIAL' | 'PAID' | 'DENIED' | 'VOID';
export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER' | 'CHECK' | 'OTHER';
export type ClaimStatus = 'DRAFT' | 'SUBMITTED' | 'ACCEPTED' | 'DENIED' | 'PAID';
export type AdmissionStatus = 'ADMITTED' | 'TRANSFERRED' | 'DISCHARGED' | 'CANCELLED';
export type BedStatus = 'AVAILABLE' | 'OCCUPIED' | 'CLEANING' | 'MAINTENANCE';
export type SurgeryStatus = 'REQUESTED' | 'SCHEDULED' | 'PRE_OP' | 'IN_PROGRESS' | 'RECOVERY' | 'COMPLETED' | 'CANCELLED';
export type SurgeryPriority = 'ELECTIVE' | 'URGENT' | 'EMERGENCY';
export type AnesthesiaType = 'GENERAL' | 'REGIONAL_SPINAL' | 'REGIONAL_EPIDURAL' | 'REGIONAL_NERVE_BLOCK' | 'MAC' | 'LOCAL' | 'TOPICAL';
export type AsaPhysicalStatus = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | 'E';
export type SurgicalRole = 'LEAD_SURGEON' | 'ASSISTANT_SURGEON' | 'ANESTHESIOLOGIST' | 'ANESTHETIST_NURSE' | 'SCRUB_NURSE' | 'CIRCULATING_NURSE' | 'TECHNICIAN';
export type WoundClass = 'CLEAN' | 'CLEAN_CONTAMINATED' | 'CONTAMINATED' | 'DIRTY_INFECTED';

export interface Encounter {
    id: string;
    patientId: string;
    providerId: string;
    appointmentId?: string;
    admissionId?: string;
    status: EncounterStatus;
    reasonForVisit?: string;
    diagnosis?: string;
    assessment?: string;
    plan?: string;
    startTime: string;
    endTime?: string;
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
    appointment?: {
        id: string;
        startTime: string;
        endTime: string;
        status: AppointmentStatus;
    };
    admission?: {
        id: string;
        status: AdmissionStatus;
        admitDate: string;
        dischargeDate?: string;
    };
}

export interface CreateEncounterRequest {
    patientId: string;
    providerId: string;
    appointmentId?: string;
    admissionId?: string;
    status?: EncounterStatus;
    reasonForVisit?: string;
    diagnosis?: string;
    assessment?: string;
    plan?: string;
    startTime?: string;
    endTime?: string;
    notes?: string;
}

export interface ClinicalOrder {
    id: string;
    patientId: string;
    providerId: string;
    encounterId?: string;
    orderType: OrderType;
    status: OrderStatus;
    priority: OrderPriority;
    orderedAt: string;
    orderName: string;
    description?: string;
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
    encounter?: {
        id: string;
        status: EncounterStatus;
        startTime: string;
    };
}

export interface CreateClinicalOrderRequest {
    patientId: string;
    providerId: string;
    encounterId?: string;
    orderType: OrderType;
    status?: OrderStatus;
    priority?: OrderPriority;
    orderedAt?: string;
    orderName: string;
    description?: string;
    notes?: string;
}

export interface ClinicalResult {
    id: string;
    orderId: string;
    patientId: string;
    reportedAt: string;
    resultName: string;
    value?: string;
    unit?: string;
    referenceRange?: string;
    status: ResultStatus;
    flag: ResultFlag;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
    order?: {
        id: string;
        orderName: string;
        orderType: OrderType;
        status: OrderStatus;
    };
    patient?: {
        id: string;
        mrn: string;
        firstName: string;
        lastName: string;
    };
}

export interface CreateClinicalResultRequest {
    orderId: string;
    patientId: string;
    reportedAt?: string;
    resultName: string;
    value?: string;
    unit?: string;
    referenceRange?: string;
    status?: ResultStatus;
    flag?: ResultFlag;
    notes?: string;
}

export interface MedicationOrder {
    id: string;
    patientId: string;
    providerId?: string;
    encounterId?: string;
    status: MedicationOrderStatus;
    medicationName: string;
    dose?: string;
    route?: MedicationRoute;
    frequency?: string;
    startDate?: string;
    endDate?: string;
    lastAdministeredAt?: string;
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
    encounter?: {
        id: string;
        status: EncounterStatus;
        startTime: string;
    };
}

export interface CreateMedicationOrderRequest {
    patientId: string;
    providerId?: string;
    encounterId?: string;
    status?: MedicationOrderStatus;
    medicationName: string;
    dose?: string;
    route?: MedicationRoute;
    frequency?: string;
    startDate?: string;
    endDate?: string;
    lastAdministeredAt?: string;
    indication?: string;
    notes?: string;
}

export interface MedicationAdministration {
    id: string;
    medicationOrderId: string;
    patientId: string;
    administeredById?: string;
    administeredAt: string;
    doseGiven?: string;
    status: MedicationAdministrationStatus;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
    medicationOrder?: {
        id: string;
        medicationName: string;
        dose?: string;
        route?: MedicationRoute;
        frequency?: string;
    };
    patient?: {
        id: string;
        mrn: string;
        firstName: string;
        lastName: string;
    };
    administeredBy?: {
        id: string;
        firstName: string;
        lastName: string;
        role: Role;
    };
}

export interface CreateMedicationAdministrationRequest {
    medicationOrderId: string;
    patientId: string;
    administeredById?: string;
    administeredAt?: string;
    doseGiven?: string;
    status?: MedicationAdministrationStatus;
    notes?: string;
}

export interface Ward {
    id: string;
    name: string;
    departmentId?: string;
    notes?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
    department?: {
        id: string;
        name: string;
    };
}

export interface CreateWardRequest {
    name: string;
    departmentId?: string;
    notes?: string;
    isActive?: boolean;
}

export interface Bed {
    id: string;
    wardId: string;
    roomNumber?: string;
    bedLabel: string;
    status: BedStatus;
    isActive: boolean;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
    ward?: {
        id: string;
        name: string;
    };
}

export interface CreateBedRequest {
    wardId: string;
    roomNumber?: string;
    bedLabel: string;
    status?: BedStatus;
    isActive?: boolean;
    notes?: string;
}

export interface Admission {
    id: string;
    patientId: string;
    providerId: string;
    wardId?: string;
    bedId?: string;
    departmentId?: string;
    status: AdmissionStatus;
    admitDate: string;
    dischargeDate?: string;
    reason?: string;
    diagnosis?: string;
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
    ward?: {
        id: string;
        name: string;
    };
    bed?: {
        id: string;
        bedLabel: string;
        roomNumber?: string;
        status: BedStatus;
    };
    department?: {
        id: string;
        name: string;
    };
}

export interface CreateAdmissionRequest {
    patientId: string;
    providerId: string;
    wardId?: string;
    bedId?: string;
    departmentId?: string;
    status?: AdmissionStatus;
    admitDate?: string;
    dischargeDate?: string;
    reason?: string;
    diagnosis?: string;
    notes?: string;
}

export interface InvoiceItem {
    id?: string;
    description: string;
    quantity?: number;
    unitPrice: number;
    totalPrice?: number;
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    patientId: string;
    encounterId?: string;
    status: InvoiceStatus;
    totalAmount: number;
    dueDate?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
    patient?: {
        id: string;
        mrn: string;
        firstName: string;
        lastName: string;
    };
    encounter?: {
        id: string;
        status: EncounterStatus;
        startTime: string;
    };
    items?: InvoiceItem[];
    payments?: Payment[];
    claims?: Claim[];
}

export interface CreateInvoiceRequest {
    patientId: string;
    encounterId?: string;
    status?: InvoiceStatus;
    totalAmount?: number;
    dueDate?: string;
    notes?: string;
    items?: InvoiceItem[];
}

export interface Payment {
    id: string;
    invoiceId: string;
    patientId: string;
    amount: number;
    method: PaymentMethod;
    paidAt: string;
    reference?: string;
    receivedById?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
    invoice?: {
        id: string;
        invoiceNumber: string;
        status: InvoiceStatus;
        totalAmount: number;
    };
    patient?: {
        id: string;
        mrn: string;
        firstName: string;
        lastName: string;
    };
    receivedBy?: {
        id: string;
        firstName: string;
        lastName: string;
        role: Role;
    };
}

export interface CreatePaymentRequest {
    invoiceId: string;
    patientId: string;
    amount: number;
    method: PaymentMethod;
    paidAt?: string;
    reference?: string;
    receivedById?: string;
    notes?: string;
}

export interface Claim {
    id: string;
    invoiceId: string;
    patientId: string;
    payerName: string;
    status: ClaimStatus;
    submittedAt?: string;
    resolvedAt?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
    invoice?: {
        id: string;
        invoiceNumber: string;
        status: InvoiceStatus;
        totalAmount: number;
    };
    patient?: {
        id: string;
        mrn: string;
        firstName: string;
        lastName: string;
    };
}

export interface CreateClaimRequest {
    invoiceId: string;
    patientId: string;
    payerName: string;
    status?: ClaimStatus;
    submittedAt?: string;
    resolvedAt?: string;
    notes?: string;
}

export type NeurologyVisitStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface NeurologyVisit {
    id: string;
    patientId: string;
    providerId: string;
    status: NeurologyVisitStatus;
    visitDate: string;
    reason?: string;
    symptoms?: string;
    mentalStatus?: string;
    cranialNerves?: string;
    motorExam?: string;
    sensoryExam?: string;
    reflexes?: string;
    coordination?: string;
    gait?: string;
    speech?: string;
    nihssScore?: number;
    gcsScore?: number;
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

export interface CreateNeurologyVisitRequest {
    patientId: string;
    providerId: string;
    status?: NeurologyVisitStatus;
    visitDate: string;
    reason?: string;
    symptoms?: string;
    mentalStatus?: string;
    cranialNerves?: string;
    motorExam?: string;
    sensoryExam?: string;
    reflexes?: string;
    coordination?: string;
    gait?: string;
    speech?: string;
    nihssScore?: number;
    gcsScore?: number;
    diagnosis?: string;
    assessment?: string;
    plan?: string;
    notes?: string;
}

export interface AppointmentMeta {
    visitTypes: VisitType[];
    locations: Location[];
    providers: Provider[];
}

export interface OperatingTheater {
    id: string;
    name: string;
    location?: string;
    status: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
    surgeries?: Surgery[];
}

export interface CreateOperatingTheaterRequest {
    name: string;
    location?: string;
    status?: string;
    notes?: string;
}

export interface Surgery {
    id: string;
    patientId: string;
    admissionId?: string;
    theaterId?: string;
    status: SurgeryStatus;
    priority: SurgeryPriority;
    scheduledStart: string;
    scheduledEnd: string;
    actualStart?: string;
    actualEnd?: string;
    preOpDiagnosis: string;
    postOpDiagnosis?: string;
    procedureName: string;
    createdAt?: string;
    updatedAt?: string;
    patient?: {
        id: string;
        mrn: string;
        firstName: string;
        lastName: string;
        phone?: string;
    };
    admission?: {
        id: string;
        admitDate: string;
        reason?: string;
        diagnosis?: string;
    };
    theater?: {
        id: string;
        name: string;
        location?: string;
    };
    teamMembers?: SurgeryTeamMember[];
    checklists?: SurgeryChecklist[];
    anesthesiaRecord?: AnesthesiaRecord;
    operativeReport?: OperativeReport;
}

export interface CreateSurgeryRequest {
    patientId: string;
    admissionId?: string;
    theaterId?: string;
    status?: SurgeryStatus;
    priority?: SurgeryPriority;
    scheduledStart: string;
    scheduledEnd: string;
    preOpDiagnosis: string;
    postOpDiagnosis?: string;
    procedureName: string;
}

export interface SurgeryTeamMember {
    id: string;
    surgeryId: string;
    userId: string;
    role: SurgicalRole;
    notes?: string;
    user?: {
        id: string;
        firstName: string;
        lastName: string;
        role: Role;
        specialty?: string;
    };
}

export interface AddTeamMemberRequest {
    surgeryId: string;
    userId: string;
    role: SurgicalRole;
    notes?: string;
}

export interface RemoveTeamMemberRequest {
    surgeryId: string;
    userId: string;
    role: SurgicalRole;
}

export interface SurgeryChecklist {
    id: string;
    surgeryId: string;
    stage: string;
    items: unknown;
    completedById: string;
    completedAt: string;
    completedBy?: {
        id: string;
        firstName: string;
        lastName: string;
    };
}

export interface AnesthesiaRecord {
    id: string;
    surgeryId: string;
    anesthesiaType: AnesthesiaType;
    asaStatus: AsaPhysicalStatus;
    inductionTime?: string;
    emergenceTime?: string;
    airwayNotes?: string;
    medications?: unknown;
    ivFluids?: unknown;
    bloodProducts?: unknown;
    complications?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface OperativeReport {
    id: string;
    surgeryId: string;
    surgeonId: string;
    procedureDescription: string;
    findings?: string;
    woundClass?: WoundClass;
    estimatedBloodLoss?: number;
    specimensRemoved?: string;
    implantsInserted?: string;
    complications?: string;
    postOpInstructions?: string;
    createdAt?: string;
    updatedAt?: string;
    surgeon?: {
        id: string;
        firstName: string;
        lastName: string;
    };
}

// Gastroenterology Types
export type EndoscopyStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type EndoscopyQuality = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';

export interface GastroEndoscopy {
    id: string;
    patientId: string;
    providerId: string;
    procedureDate: string;
    indication: string;
    status: EndoscopyStatus;
    sedationType?: string;
    scopeInsertion?: string;
    esophagus?: string;
    gastroesophagealJunction?: string;
    stomach?: string;
    pylorus?: string;
    duodenum?: string;
    mucosalAppearance?: string;
    lesionsFound?: boolean;
    lesionsDescription?: string;
    biopsiesTaken?: number;
    biopsySites?: string;
    hemostasisPerformed?: boolean;
    hemostasisMethod?: string;
    polypectomy?: boolean;
    polypsRemoved?: number;
    polypSizeMm?: number;
    complications?: string;
    recommendations?: string;
    followUpInterval?: string;
    prepQuality?: EndoscopyQuality;
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
    };
}

export interface CreateGastroEndoscopyRequest {
    patientId: string;
    providerId: string;
    procedureDate: string;
    indication: string;
    status?: EndoscopyStatus;
    sedationType?: string;
    scopeInsertion?: string;
    esophagus?: string;
    gastroesophagealJunction?: string;
    stomach?: string;
    pylorus?: string;
    duodenum?: string;
    mucosalAppearance?: string;
    lesionsFound?: boolean;
    lesionsDescription?: string;
    biopsiesTaken?: number;
    biopsySites?: string;
    hemostasisPerformed?: boolean;
    hemostasisMethod?: string;
    polypectomy?: boolean;
    polypsRemoved?: number;
    polypSizeMm?: number;
    complications?: string;
    recommendations?: string;
    followUpInterval?: string;
    prepQuality?: EndoscopyQuality;
    notes?: string;
}

export interface GastroColonoscopy {
    id: string;
    patientId: string;
    providerId: string;
    procedureDate: string;
    indication: string;
    status: EndoscopyStatus;
    sedationType?: string;
    scopeInsertion?: string;
    cecalIntubation?: boolean;
    cecalIntubationTime?: number;
    withdrawalTime?: number;
    prepQuality?: EndoscopyQuality;
    ileumExamined?: boolean;
    mucosalAppearance?: string;
    lesionsFound?: boolean;
    lesionsDescription?: string;
    polypsFound?: boolean;
    polypsRemoved?: number;
    polypSizeMaxMm?: number;
    polypHistology?: string;
    biopsiesTaken?: number;
    biopsySites?: string;
    hemostasisPerformed?: boolean;
    complications?: string;
    recommendations?: string;
    followUpInterval?: string;
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
    };
}

export interface CreateGastroColonoscopyRequest {
    patientId: string;
    providerId: string;
    procedureDate: string;
    indication: string;
    status?: EndoscopyStatus;
    sedationType?: string;
    scopeInsertion?: string;
    cecalIntubation?: boolean;
    cecalIntubationTime?: number;
    withdrawalTime?: number;
    prepQuality?: EndoscopyQuality;
    ileumExamined?: boolean;
    mucosalAppearance?: string;
    lesionsFound?: boolean;
    lesionsDescription?: string;
    polypsFound?: boolean;
    polypsRemoved?: number;
    polypSizeMaxMm?: number;
    polypHistology?: string;
    biopsiesTaken?: number;
    biopsySites?: string;
    hemostasisPerformed?: boolean;
    complications?: string;
    recommendations?: string;
    followUpInterval?: string;
    notes?: string;
}

export interface GastroLiverFunction {
    id: string;
    patientId: string;
    testDate: string;
    alt?: number;
    ast?: number;
    alp?: number;
    ggt?: number;
    totalBilirubin?: number;
    directBilirubin?: number;
    indirectBilirubin?: number;
    totalProtein?: number;
    albumin?: number;
    globulin?: number;
    agRatio?: number;
    pt?: number;
    inr?: number;
    ptt?: number;
    fibroscanScore?: number;
    fibrosisStage?: string;
    steatosisGrade?: string;
    capScore?: number;
    diagnosis?: string;
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
}

export interface CreateGastroLiverFunctionRequest {
    patientId: string;
    testDate: string;
    alt?: number;
    ast?: number;
    alp?: number;
    ggt?: number;
    totalBilirubin?: number;
    directBilirubin?: number;
    indirectBilirubin?: number;
    totalProtein?: number;
    albumin?: number;
    globulin?: number;
    agRatio?: number;
    pt?: number;
    inr?: number;
    ptt?: number;
    fibroscanScore?: number;
    fibrosisStage?: string;
    steatosisGrade?: string;
    capScore?: number;
    diagnosis?: string;
    interpretation?: string;
    notes?: string;
}

// ============================================
// NEUROLOGY TYPES
// ============================================

export type NeurologyTestStatus = 'ORDERED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type NeurologyImagingType = 'CT_HEAD' | 'CT_HEAD_WITH_CONTRAST' | 'MRI_BRAIN' | 'MRI_BRAIN_WITH_CONTRAST' | 'CTA_HEAD' | 'MRA_HEAD' | 'PET_BRAIN' | 'OTHER';
export type StrokeType = 'ISCHEMIC' | 'HEMORRHAGIC' | 'TIA';
export type StrokeSeverity = 'MILD' | 'MODERATE' | 'SEVERE';
export type SeizureType = 'FOCAL_ONSET_AWARE' | 'FOCAL_ONSET_IMPAIRED' | 'GENERALIZED_TONIC_CLONIC' | 'ABSENCE' | 'MYOCLONIC' | 'ATONIC' | 'UNKNOWN' | 'STATUS_EPILEPTICUS';

export interface NeurologyEeg {
    id: string;
    patientId: string;
    providerId?: string;
    visitId?: string;
    status: NeurologyTestStatus;
    recordedAt: string;
    durationMinutes?: number;
    indication?: string;
    findings?: string;
    interpretation?: string;
    seizuresDetected?: boolean;
    seizureCount?: number;
    backgroundActivity?: string;
    sleepArchitecture?: string;
    photicStimulation?: boolean;
    hyperventilation?: boolean;
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

export interface CreateNeurologyEegRequest {
    patientId: string;
    providerId?: string;
    visitId?: string;
    status?: NeurologyTestStatus;
    recordedAt: string;
    durationMinutes?: number;
    indication?: string;
    findings?: string;
    interpretation?: string;
    seizuresDetected?: boolean;
    seizureCount?: number;
    backgroundActivity?: string;
    sleepArchitecture?: string;
    photicStimulation?: boolean;
    hyperventilation?: boolean;
    notes?: string;
}

export interface NeurologyEmg {
    id: string;
    patientId: string;
    providerId?: string;
    visitId?: string;
    status: NeurologyTestStatus;
    performedAt: string;
    indication?: string;
    musclesTested?: string;
    findings?: string;
    interpretation?: string;
    neuropathyPresent?: boolean;
    myopathyPresent?: boolean;
    conductionVelocity?: number;
    amplitude?: number;
    distalLatency?: number;
    fWaveLatency?: number;
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

export interface CreateNeurologyEmgRequest {
    patientId: string;
    providerId?: string;
    visitId?: string;
    status?: NeurologyTestStatus;
    performedAt: string;
    indication?: string;
    musclesTested?: string;
    findings?: string;
    interpretation?: string;
    neuropathyPresent?: boolean;
    myopathyPresent?: boolean;
    conductionVelocity?: number;
    amplitude?: number;
    distalLatency?: number;
    fWaveLatency?: number;
    notes?: string;
}

export interface NeurologyImaging {
    id: string;
    patientId: string;
    providerId?: string;
    visitId?: string;
    status: NeurologyTestStatus;
    performedAt: string;
    imagingType: NeurologyImagingType;
    indication?: string;
    findings?: string;
    impression?: string;
    acuteFindings?: boolean;
    strokePresent?: boolean;
    hemorrhagePresent?: boolean;
    massPresent?: boolean;
    contrastUsed?: boolean;
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

export interface CreateNeurologyImagingRequest {
    patientId: string;
    providerId?: string;
    visitId?: string;
    status?: NeurologyTestStatus;
    performedAt: string;
    imagingType: NeurologyImagingType;
    indication?: string;
    findings?: string;
    impression?: string;
    acuteFindings?: boolean;
    strokePresent?: boolean;
    hemorrhagePresent?: boolean;
    massPresent?: boolean;
    contrastUsed?: boolean;
    notes?: string;
}

export interface NeurologyStroke {
    id: string;
    patientId: string;
    providerId: string;
    onsetTime: string;
    arrivalTime: string;
    strokeType: StrokeType;
    severity: StrokeSeverity;
    nihssScore: number;
    nihssDetails?: string;
    location?: string;
    ctDone?: boolean;
    ctTime?: string;
    ctFindings?: string;
    mriDone?: boolean;
    mriTime?: string;
    mriFindings?: string;
    thrombolysisGiven?: boolean;
    thrombolysisTime?: string;
    thrombectomyDone?: boolean;
    thrombectomyTime?: string;
    tpaDose?: number;
    bpManagement?: string;
    complications?: string;
    dischargeNihss?: number;
    mrsAtDischarge?: number;
    dischargeDisposition?: string;
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

export interface CreateNeurologyStrokeRequest {
    patientId: string;
    providerId: string;
    onsetTime: string;
    arrivalTime: string;
    strokeType: StrokeType;
    severity: StrokeSeverity;
    nihssScore: number;
    nihssDetails?: string;
    location?: string;
    ctDone?: boolean;
    ctTime?: string;
    ctFindings?: string;
    mriDone?: boolean;
    mriTime?: string;
    mriFindings?: string;
    thrombolysisGiven?: boolean;
    thrombolysisTime?: string;
    thrombectomyDone?: boolean;
    thrombectomyTime?: string;
    tpaDose?: number;
    bpManagement?: string;
    complications?: string;
    dischargeNihss?: number;
    mrsAtDischarge?: number;
    dischargeDisposition?: string;
    notes?: string;
}

export interface NeurologySeizure {
    id: string;
    patientId: string;
    providerId?: string;
    eventTime: string;
    seizureType: SeizureType;
    durationSeconds?: number;
    witnessed?: boolean;
    witnessedBy?: string;
    auraPresent?: boolean;
    auraDescription?: string;
    lossOfConsciousness?: boolean;
    incontinence?: boolean;
    tongueBite?: boolean;
    postIctalConfusion?: boolean;
    postIctalDuration?: number;
    triggers?: string;
    eegCorrelation?: string;
    medicationChange?: string;
    injurySustained?: string;
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

export interface CreateNeurologySeizureRequest {
    patientId: string;
    providerId?: string;
    eventTime: string;
    seizureType: SeizureType;
    durationSeconds?: number;
    witnessed?: boolean;
    witnessedBy?: string;
    auraPresent?: boolean;
    auraDescription?: string;
    lossOfConsciousness?: boolean;
    incontinence?: boolean;
    tongueBite?: boolean;
    postIctalConfusion?: boolean;
    postIctalDuration?: number;
    triggers?: string;
    eegCorrelation?: string;
    medicationChange?: string;
    injurySustained?: string;
    notes?: string;
}

export interface NeurologyCognitiveAssessment {
    id: string;
    patientId: string;
    providerId: string;
    assessmentDate: string;
    mmseScore?: number;
    mocaScore?: number;
    clockDrawingTest?: string;
    verbalFluencyScore?: number;
    trailMakingA?: number;
    trailMakingB?: number;
    delayedRecall?: number;
    attentionTest?: string;
    languageAssessment?: string;
    visuospatialScore?: number;
    executiveFunction?: string;
    overallImpression?: string;
    diagnosis?: string;
    recommendations?: string;
    followUpNeeded?: boolean;
    followUpDate?: string;
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

export interface CreateNeurologyCognitiveRequest {
    patientId: string;
    providerId: string;
    assessmentDate: string;
    mmseScore?: number;
    mocaScore?: number;
    clockDrawingTest?: string;
    verbalFluencyScore?: number;
    trailMakingA?: number;
    trailMakingB?: number;
    delayedRecall?: number;
    attentionTest?: string;
    languageAssessment?: string;
    visuospatialScore?: number;
    executiveFunction?: string;
    overallImpression?: string;
    diagnosis?: string;
    recommendations?: string;
    followUpNeeded?: boolean;
    followUpDate?: string;
    notes?: string;
}

// ============================================
// ONCOLOGY TYPES
// ============================================

export type ChemotherapyStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED' | 'CANCELLED' | 'HELD';
export type RadiationStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED' | 'CANCELLED' | 'HELD';
export type TumorBoardStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
export type CancerStage = 'STAGE_0' | 'STAGE_I' | 'STAGE_IA' | 'STAGE_IB' | 'STAGE_II' | 'STAGE_IIA' | 'STAGE_IIB' | 'STAGE_III' | 'STAGE_IIIA' | 'STAGE_IIIB' | 'STAGE_IIIC' | 'STAGE_IV' | 'UNKNOWN';

export interface OncologyChemotherapy {
    id: string;
    patientId: string;
    providerId: string;
    protocolName: string;
    cancerType: string;
    cycleNumber: number;
    totalCycles: number;
    status: ChemotherapyStatus;
    scheduledDate: string;
    administeredDate?: string;
    premedications?: string;
    chemotherapyAgents?: string;
    doses?: string;
    route?: string;
    durationHours?: number;
    tolerance?: string;
    sideEffects?: string;
    doseModifications?: string;
    nextCycleDate?: string;
    growthFactorGiven?: boolean;
    labsReviewed?: boolean;
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

export interface CreateOncologyChemotherapyRequest {
    patientId: string;
    providerId: string;
    protocolName: string;
    cancerType: string;
    cycleNumber: number;
    totalCycles: number;
    status?: ChemotherapyStatus;
    scheduledDate: string;
    administeredDate?: string;
    premedications?: string;
    chemotherapyAgents?: string;
    doses?: string;
    route?: string;
    durationHours?: number;
    tolerance?: string;
    sideEffects?: string;
    doseModifications?: string;
    nextCycleDate?: string;
    growthFactorGiven?: boolean;
    labsReviewed?: boolean;
    notes?: string;
}

export interface OncologyRadiation {
    id: string;
    patientId: string;
    providerId: string;
    cancerType: string;
    treatmentSite: string;
    totalDoseGy: number;
    fractions: number;
    dosePerFraction: number;
    status: RadiationStatus;
    startDate?: string;
    completionDate?: string;
    fractionNumber?: number;
    technique?: string;
    energy?: string;
    simulationDate?: string;
    planningCtDate?: string;
    skinReactions?: string;
    fatigueLevel?: string;
    esophagitisGrade?: string;
    otherSideEffects?: string;
    treatmentBreaks?: number;
    breakReason?: string;
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

export interface CreateOncologyRadiationRequest {
    patientId: string;
    providerId: string;
    cancerType: string;
    treatmentSite: string;
    totalDoseGy: number;
    fractions: number;
    dosePerFraction: number;
    status?: RadiationStatus;
    startDate?: string;
    completionDate?: string;
    fractionNumber?: number;
    technique?: string;
    energy?: string;
    simulationDate?: string;
    planningCtDate?: string;
    skinReactions?: string;
    fatigueLevel?: string;
    esophagitisGrade?: string;
    otherSideEffects?: string;
    treatmentBreaks?: number;
    breakReason?: string;
    notes?: string;
}

export interface OncologyStaging {
    id: string;
    patientId: string;
    providerId: string;
    cancerType: string;
    histology?: string;
    grade?: string;
    tStage?: string;
    nStage?: string;
    mStage?: string;
    overallStage: CancerStage;
    stageGrouping?: string;
    stagingDate: string;
    stagingMethod?: string;
    tumorSizeCm?: number;
    nodesPositive?: number;
    nodesExamined?: number;
    metastasisSites?: string;
    biomarkers?: string;
    stagingImaging?: string;
    pathologyReport?: string;
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

export interface CreateOncologyStagingRequest {
    patientId: string;
    providerId: string;
    cancerType: string;
    histology?: string;
    grade?: string;
    tStage?: string;
    nStage?: string;
    mStage?: string;
    overallStage: CancerStage;
    stageGrouping?: string;
    stagingDate: string;
    stagingMethod?: string;
    tumorSizeCm?: number;
    nodesPositive?: number;
    nodesExamined?: number;
    metastasisSites?: string;
    biomarkers?: string;
    stagingImaging?: string;
    pathologyReport?: string;
    notes?: string;
}

export interface OncologyTumorBoard {
    id: string;
    patientId: string;
    presenterId: string;
    status: TumorBoardStatus;
    meetingDate: string;
    cancerType: string;
    stage?: string;
    casePresentation?: string;
    imagingReviewed?: string;
    pathologyReviewed?: string;
    molecularTesting?: string;
    treatmentOptions?: string;
    recommendedPlan?: string;
    clinicalTrialOffered?: boolean;
    trialName?: string;
    attendees?: string;
    consensusReached?: boolean;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
    patient?: {
        id: string;
        mrn: string;
        firstName: string;
        lastName: string;
    };
    presenter?: {
        id: string;
        firstName: string;
        lastName: string;
        role: Role;
    };
}

export interface CreateOncologyTumorBoardRequest {
    patientId: string;
    presenterId: string;
    status?: TumorBoardStatus;
    meetingDate: string;
    cancerType: string;
    stage?: string;
    casePresentation?: string;
    imagingReviewed?: string;
    pathologyReviewed?: string;
    molecularTesting?: string;
    treatmentOptions?: string;
    recommendedPlan?: string;
    clinicalTrialOffered?: boolean;
    trialName?: string;
    attendees?: string;
    consensusReached?: boolean;
    notes?: string;
}

// ============================================
// PEDIATRICS TYPES
// ============================================

export interface PedsGrowthChart {
    id: string;
    patientId: string;
    providerId: string;
    measurementDate: string;
    ageMonths: number;
    weightKg: number;
    heightCm: number;
    headCircumferenceCm?: number;
    bmi?: number;
    weightPercentile?: number;
    heightPercentile?: number;
    bmiPercentile?: number;
    headCircPercentile?: number;
    weightForLength?: number;
    growthVelocity?: string;
    nutritionalStatus?: string;
    zScoreWeight?: number;
    zScoreHeight?: number;
    plotOnWhoChart?: boolean;
    plotOnCdcChart?: boolean;
    prematureCorrection?: boolean;
    weeksPremature?: number;
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

export interface CreatePedsGrowthChartRequest {
    patientId: string;
    providerId: string;
    measurementDate: string;
    ageMonths: number;
    weightKg: number;
    heightCm: number;
    headCircumferenceCm?: number;
    bmi?: number;
    weightPercentile?: number;
    heightPercentile?: number;
    bmiPercentile?: number;
    headCircPercentile?: number;
    weightForLength?: number;
    growthVelocity?: string;
    nutritionalStatus?: string;
    zScoreWeight?: number;
    zScoreHeight?: number;
    plotOnWhoChart?: boolean;
    plotOnCdcChart?: boolean;
    prematureCorrection?: boolean;
    weeksPremature?: number;
    notes?: string;
}

export interface PedsVaccination {
    id: string;
    patientId: string;
    providerId: string;
    vaccineName: string;
    vaccineCode?: string;
    doseNumber: number;
    totalDoses: number;
    dateGiven: string;
    ageAtVaccination?: string;
    site?: string;
    route?: string;
    lotNumber?: string;
    manufacturer?: string;
    expirationDate?: string;
    sideEffects?: string;
    contraindications?: string;
    catchUpSchedule?: boolean;
    dueDate?: string;
    nextDoseDue?: string;
    administeredBy?: string;
    consentSigned?: boolean;
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

export interface CreatePedsVaccinationRequest {
    patientId: string;
    providerId: string;
    vaccineName: string;
    vaccineCode?: string;
    doseNumber: number;
    totalDoses: number;
    dateGiven: string;
    ageAtVaccination?: string;
    site?: string;
    route?: string;
    lotNumber?: string;
    manufacturer?: string;
    expirationDate?: string;
    sideEffects?: string;
    contraindications?: string;
    catchUpSchedule?: boolean;
    dueDate?: string;
    nextDoseDue?: string;
    administeredBy?: string;
    consentSigned?: boolean;
    notes?: string;
}

export interface PedsDevelopmental {
    id: string;
    patientId: string;
    providerId: string;
    assessmentDate: string;
    ageMonths: number;
    grossMotor?: string;
    fineMotor?: string;
    language?: string;
    socialEmotional?: string;
    cognitive?: string;
    problemSolving?: string;
    personalSocial?: string;
    concernsIdentified?: boolean;
    concernsDescription?: string;
    milestonesAchieved?: string;
    milestonesDelayed?: string;
    asqCompleted?: boolean;
    asqScore?: string;
    mchatCompleted?: boolean;
    mchatScore?: number;
    autismScreenPositive?: boolean;
    earlyInterventionReferral?: boolean;
    speechTherapyReferral?: boolean;
    occupationalTherapyReferral?: boolean;
    hearingTestDone?: boolean;
    visionTestDone?: boolean;
    followUpNeeded?: boolean;
    followUpDate?: string;
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

export interface CreatePedsDevelopmentalRequest {
    patientId: string;
    providerId: string;
    assessmentDate: string;
    ageMonths: number;
    grossMotor?: string;
    fineMotor?: string;
    language?: string;
    socialEmotional?: string;
    cognitive?: string;
    problemSolving?: string;
    personalSocial?: string;
    concernsIdentified?: boolean;
    concernsDescription?: string;
    milestonesAchieved?: string;
    milestonesDelayed?: string;
    asqCompleted?: boolean;
    asqScore?: string;
    mchatCompleted?: boolean;
    mchatScore?: number;
    autismScreenPositive?: boolean;
    earlyInterventionReferral?: boolean;
    speechTherapyReferral?: boolean;
    occupationalTherapyReferral?: boolean;
    hearingTestDone?: boolean;
    visionTestDone?: boolean;
    followUpNeeded?: boolean;
    followUpDate?: string;
    notes?: string;
}

// ============================================
// OBGYN TYPES
// ============================================

export type PregnancyStatus = 'ACTIVE' | 'COMPLETED' | 'MISCARRIAGE' | 'TERMINATED' | 'ECTOPIC' | 'MOLAR';
export type Trimester = 'FIRST' | 'SECOND' | 'THIRD';
export type DeliveryMode = 'VAGINAL_SPONTANEOUS' | 'VAGINAL_ASSISTED_VACUUM' | 'VAGINAL_ASSISTED_FORCEPS' | 'CESAREAN_ELECTIVE' | 'CESAREAN_EMERGENCY';

export interface ObgynPregnancy {
    id: string;
    patientId: string;
    providerId: string;
    lmpDate: string;
    eddDate: string;
    gestationalAgeWeeks?: number;
    gravida: number;
    para: number;
    abortions: number;
    livingChildren: number;
    status: PregnancyStatus;
    conceptionMethod?: string;
    ivfCycleNumber?: string;
    multipleGestation?: boolean;
    numberOfFetuses?: number;
    riskFactors?: string;
    previousCesarean?: number;
    rhStatus?: string;
    rubellaStatus?: string;
    hepatitisBStatus?: string;
    hivStatus?: string;
    syphilisStatus?: string;
    gbsStatus?: string;
    initialWeight?: number;
    initialBmi?: number;
    preExistingConditions?: string;
    currentMedications?: string;
    allergies?: string;
    deliveryDate?: string;
    deliveryMode?: DeliveryMode;
    deliveryOutcome?: string;
    babyWeightGrams?: number;
    babyApgar1?: number;
    babyApgar5?: number;
    babyApgar10?: number;
    complications?: string;
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

export interface CreateObgynPregnancyRequest {
    patientId: string;
    providerId: string;
    lmpDate: string;
    eddDate: string;
    gestationalAgeWeeks?: number;
    gravida: number;
    para: number;
    abortions: number;
    livingChildren: number;
    status?: PregnancyStatus;
    conceptionMethod?: string;
    ivfCycleNumber?: string;
    multipleGestation?: boolean;
    numberOfFetuses?: number;
    riskFactors?: string;
    previousCesarean?: number;
    rhStatus?: string;
    rubellaStatus?: string;
    hepatitisBStatus?: string;
    hivStatus?: string;
    syphilisStatus?: string;
    gbsStatus?: string;
    initialWeight?: number;
    initialBmi?: number;
    preExistingConditions?: string;
    currentMedications?: string;
    allergies?: string;
    deliveryDate?: string;
    deliveryMode?: DeliveryMode;
    deliveryOutcome?: string;
    babyWeightGrams?: number;
    babyApgar1?: number;
    babyApgar5?: number;
    babyApgar10?: number;
    complications?: string;
    notes?: string;
}

export interface ObgynAntenatal {
    id: string;
    pregnancyId: string;
    visitDate: string;
    gestationalAgeWeeks: number;
    trimester: Trimester;
    weight?: number;
    bloodPressure?: string;
    fundalHeight?: number;
    fetalHeartRate?: number;
    fetalMovement?: boolean;
    presentation?: string;
    edema?: string;
    proteinuria?: string;
    glucosuria?: string;
    hemoglobin?: number;
    ultrasoundFindings?: string;
    screeningTests?: string;
    medications?: string;
    complaints?: string;
    nextVisitDate?: string;
    riskAssessment?: string;
    referralNeeded?: boolean;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
    pregnancy?: {
        id: string;
        patientId: string;
        eddDate: string;
        status: PregnancyStatus;
    };
}

export interface CreateObgynAntenatalRequest {
    pregnancyId: string;
    visitDate: string;
    gestationalAgeWeeks: number;
    trimester: Trimester;
    weight?: number;
    bloodPressure?: string;
    fundalHeight?: number;
    fetalHeartRate?: number;
    fetalMovement?: boolean;
    presentation?: string;
    edema?: string;
    proteinuria?: string;
    glucosuria?: string;
    hemoglobin?: number;
    ultrasoundFindings?: string;
    screeningTests?: string;
    medications?: string;
    complaints?: string;
    nextVisitDate?: string;
    riskAssessment?: string;
    referralNeeded?: boolean;
    notes?: string;
}

export interface ObgynDelivery {
    id: string;
    patientId: string;
    providerId: string;
    deliveryDate: string;
    admissionTime: string;
    deliveryTime: string;
    deliveryMode: DeliveryMode;
    gestationalAgeWeeks: number;
    laborOnset?: string;
    membranesRuptured?: string;
    fluidColor?: string;
    inductionPerformed?: boolean;
    inductionMethod?: string;
    augmentation?: boolean;
    anesthesia?: string;
    secondStageDuration?: number;
    episiotomy?: boolean;
    laceration?: string;
    estimatedBloodLoss?: number;
    placentaDelivery?: string;
    placentaComplete?: boolean;
    babyWeightGrams: number;
    babyLengthCm?: number;
    babyHeadCircumferenceCm?: number;
    babyGender: string;
    babyApgar1: number;
    babyApgar5: number;
    babyApgar10?: number;
    resuscitationNeeded?: boolean;
    resuscitationDetails?: string;
    nicuAdmission?: boolean;
    nicuReason?: string;
    maternalComplications?: string;
    postpartumHb?: number;
    rhogamGiven?: boolean;
    dischargeDate?: string;
    breastfeedingEstablished?: boolean;
    contraceptionCounseling?: boolean;
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

export interface CreateObgynDeliveryRequest {
    patientId: string;
    providerId: string;
    deliveryDate: string;
    admissionTime: string;
    deliveryTime: string;
    deliveryMode: DeliveryMode;
    gestationalAgeWeeks: number;
    laborOnset?: string;
    membranesRuptured?: string;
    fluidColor?: string;
    inductionPerformed?: boolean;
    inductionMethod?: string;
    augmentation?: boolean;
    anesthesia?: string;
    secondStageDuration?: number;
    episiotomy?: boolean;
    laceration?: string;
    estimatedBloodLoss?: number;
    placentaDelivery?: string;
    placentaComplete?: boolean;
    babyWeightGrams: number;
    babyLengthCm?: number;
    babyHeadCircumferenceCm?: number;
    babyGender: string;
    babyApgar1: number;
    babyApgar5: number;
    babyApgar10?: number;
    resuscitationNeeded?: boolean;
    resuscitationDetails?: string;
    nicuAdmission?: boolean;
    nicuReason?: string;
    maternalComplications?: string;
    postpartumHb?: number;
    rhogamGiven?: boolean;
    dischargeDate?: string;
    breastfeedingEstablished?: boolean;
    contraceptionCounseling?: boolean;
    notes?: string;
}

// ============================================
// PSYCHIATRY TYPES
// ============================================

export type AssessmentType = 'INITIAL' | 'FOLLOW_UP' | 'CRISIS' | 'DISCHARGE' | 'ANNUAL' | 'PRE_ADMISSION' | 'FORENSIC';
export type TherapyType = 'INDIVIDUAL' | 'GROUP' | 'FAMILY' | 'COUPLES' | 'COGNITIVE_BEHAVIORAL' | 'DIALECTICAL_BEHAVIORAL' | 'PSYCHODYNAMIC' | 'SUPPORTIVE' | 'EXPOSURE';

export interface PsychiatryAssessment {
    id: string;
    patientId: string;
    providerId: string;
    assessmentDate: string;
    assessmentType: AssessmentType;
    chiefComplaint: string;
    historyOfPresentIllness?: string;
    pastPsychiatricHistory?: string;
    pastMedicalHistory?: string;
    familyHistory?: string;
    socialHistory?: string;
    substanceUseHistory?: string;
    currentMedications?: string;
    allergies?: string;
    reviewOfSystems?: string;
    mentalStatusExam?: string;
    appearance?: string;
    behavior?: string;
    speech?: string;
    mood?: string;
    affect?: string;
    thoughtProcess?: string;
    thoughtContent?: string;
    perceptions?: string;
    cognition?: string;
    insight?: string;
    judgment?: string;
    phq9Score?: number;
    gad7Score?: number;
    mdqScore?: number;
    pcptsdScore?: number;
    c_ssrsScore?: number;
    riskAssessment?: string;
    suicidalIdeation?: boolean;
    suicidalPlan?: boolean;
    suicidalIntent?: boolean;
    homicidalIdeation?: boolean;
    selfHarmBehaviors?: boolean;
    diagnosisPrimary?: string;
    diagnosisSecondary?: string;
    diagnosisCodes?: string;
    formulation?: string;
    plan?: string;
    medicationsStarted?: string;
    psychotherapyRecommended?: boolean;
    therapyType?: string;
    followUpInterval?: string;
    urgentFollowUp?: boolean;
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

export interface CreatePsychiatryAssessmentRequest {
    patientId: string;
    providerId: string;
    assessmentDate: string;
    assessmentType: AssessmentType;
    chiefComplaint: string;
    historyOfPresentIllness?: string;
    pastPsychiatricHistory?: string;
    pastMedicalHistory?: string;
    familyHistory?: string;
    socialHistory?: string;
    substanceUseHistory?: string;
    currentMedications?: string;
    allergies?: string;
    reviewOfSystems?: string;
    mentalStatusExam?: string;
    appearance?: string;
    behavior?: string;
    speech?: string;
    mood?: string;
    affect?: string;
    thoughtProcess?: string;
    thoughtContent?: string;
    perceptions?: string;
    cognition?: string;
    insight?: string;
    judgment?: string;
    phq9Score?: number;
    gad7Score?: number;
    mdqScore?: number;
    pcptsdScore?: number;
    c_ssrsScore?: number;
    riskAssessment?: string;
    suicidalIdeation?: boolean;
    suicidalPlan?: boolean;
    suicidalIntent?: boolean;
    homicidalIdeation?: boolean;
    selfHarmBehaviors?: boolean;
    diagnosisPrimary?: string;
    diagnosisSecondary?: string;
    diagnosisCodes?: string;
    formulation?: string;
    plan?: string;
    medicationsStarted?: string;
    psychotherapyRecommended?: boolean;
    therapyType?: string;
    followUpInterval?: string;
    urgentFollowUp?: boolean;
    notes?: string;
}

export interface PsychiatryTherapy {
    id: string;
    patientId: string;
    providerId: string;
    sessionDate: string;
    therapyType: TherapyType;
    sessionNumber: number;
    durationMinutes?: number;
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
    interventionsUsed?: string;
    homeworkAssigned?: string;
    progressNotes?: string;
    moodRating?: number;
    anxietyRating?: number;
    functioningLevel?: string;
    goalsDiscussed?: string;
    barriersIdentified?: string;
    copingStrategies?: string;
    crisisPlanReviewed?: boolean;
    medicationAdherence?: string;
    sideEffectsDiscussed?: boolean;
    patientEngagement?: string;
    nextSessionDate?: string;
    noShow?: boolean;
    cancellationReason?: string;
    urgentIssues?: string;
    safetyPlanUpdated?: boolean;
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

export interface CreatePsychiatryTherapyRequest {
    patientId: string;
    providerId: string;
    sessionDate: string;
    therapyType: TherapyType;
    sessionNumber: number;
    durationMinutes?: number;
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
    interventionsUsed?: string;
    homeworkAssigned?: string;
    progressNotes?: string;
    moodRating?: number;
    anxietyRating?: number;
    functioningLevel?: string;
    goalsDiscussed?: string;
    barriersIdentified?: string;
    copingStrategies?: string;
    crisisPlanReviewed?: boolean;
    medicationAdherence?: string;
    sideEffectsDiscussed?: boolean;
    patientEngagement?: string;
    nextSessionDate?: string;
    noShow?: boolean;
    cancellationReason?: string;
    urgentIssues?: string;
    safetyPlanUpdated?: boolean;
    notes?: string;
}

export interface PsychiatryMedication {
    id: string;
    patientId: string;
    providerId: string;
    assessmentDate: string;
    medicationName: string;
    genericName?: string;
    dose: string;
    frequency: string;
    route?: string;
    indication?: string;
    startedDate?: string;
    prescribedBy?: string;
    adherenceRating?: number;
    adherenceBarriers?: string;
    effectivenessRating?: number;
    sideEffectsPresent?: boolean;
    sideEffects?: string;
    sideEffectSeverity?: string;
    weightChanges?: number;
    sedationLevel?: string;
    akathisiaPresent?: boolean;
    tremorPresent?: boolean;
    bloodWorkNeeded?: boolean;
    lastClozapineLevel?: number;
    lastLithiumLevel?: number;
    lastValproateLevel?: number;
    ecgNeeded?: boolean;
    metabolicMonitoring?: boolean;
    changesMade?: string;
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

export interface CreatePsychiatryMedicationRequest {
    patientId: string;
    providerId: string;
    assessmentDate: string;
    medicationName: string;
    genericName?: string;
    dose: string;
    frequency: string;
    route?: string;
    indication?: string;
    startedDate?: string;
    prescribedBy?: string;
    adherenceRating?: number;
    adherenceBarriers?: string;
    effectivenessRating?: number;
    sideEffectsPresent?: boolean;
    sideEffects?: string;
    sideEffectSeverity?: string;
    weightChanges?: number;
    sedationLevel?: string;
    akathisiaPresent?: boolean;
    tremorPresent?: boolean;
    bloodWorkNeeded?: boolean;
    lastClozapineLevel?: number;
    lastLithiumLevel?: number;
    lastValproateLevel?: number;
    ecgNeeded?: boolean;
    metabolicMonitoring?: boolean;
    changesMade?: string;
    notes?: string;
}

// ============================================
// LIS - Laboratory Information System Types
// ============================================

export type LabTestCategory = 
  | 'HEMATOLOGY' 
  | 'CHEMISTRY' 
  | 'MICROBIOLOGY' 
  | 'SEROLOGY' 
  | 'IMMUNOLOGY' 
  | 'MOLECULAR' 
  | 'ENDOCRINOLOGY' 
  | 'TOXICOLOGY' 
  | 'URINALYSIS' 
  | 'COAGULATION' 
  | 'HISTOLOGY' 
  | 'CYTOLOGY' 
  | 'OTHER';

export type SpecimenType = 
  | 'BLOOD' 
  | 'SERUM' 
  | 'PLASMA' 
  | 'URINE' 
  | 'STOOL' 
  | 'CSF' 
  | 'SPUTUM' 
  | 'SWAB' 
  | 'TISSUE' 
  | 'FLUID' 
  | 'BONE_MARROW' 
  | 'OTHER';

export type SpecimenStatus = 
  | 'ORDERED' 
  | 'COLLECTED' 
  | 'RECEIVED' 
  | 'PROCESSING' 
  | 'COMPLETED' 
  | 'REJECTED';

export type LabWorkOrderStatus = 
  | 'PENDING' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'REJECTED';

export type LabResultStatus = 
  | 'PENDING' 
  | 'PRELIMINARY' 
  | 'FINAL' 
  | 'AMENDED' 
  | 'CANCELLED';

export type LabResultFlag = 
  | 'NORMAL' 
  | 'LOW' 
  | 'HIGH' 
  | 'CRITICAL_LOW' 
  | 'CRITICAL_HIGH' 
  | 'BORDERLINE';

export type QCControlLevel = 'NORMAL' | 'ABNORMAL_LOW' | 'ABNORMAL_HIGH';
export type QCResultStatus = 'PASS' | 'FAIL' | 'PENDING';

export interface LabTest {
  id: string;
  code: string;
  name: string;
  category: LabTestCategory;
  description?: string;
  specimenType: SpecimenType;
  containerType?: string;
  volumeRequired?: number;
  turnaroundTime: number;
  isActive: boolean;
  requiresFasting: boolean;
  specialInstructions?: string;
  referenceRanges?: ReferenceRange[];
  createdAt: string;
  updatedAt: string;
}

export interface TestPanel {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  items?: TestPanelItem[];
  createdAt: string;
  updatedAt: string;
}

export interface TestPanelItem {
  id: string;
  panelId: string;
  testId: string;
  order: number;
  test?: LabTest;
}

export interface Specimen {
  id: string;
  barcode: string;
  patientId: string;
  patient?: Patient;
  specimenType: SpecimenType;
  collectionTime: string;
  collectedById?: string;
  collectedBy?: User;
  collectionSite?: string;
  volumeCollected?: number;
  collectionNotes?: string;
  receivedTime?: string;
  receivedById?: string;
  receivedBy?: User;
  receptionNotes?: string;
  status: SpecimenStatus;
  rejectionReason?: string;
  storageLocation?: string;
  workOrders?: LabWorkOrder[];
  createdAt: string;
  updatedAt: string;
}

export interface LabWorkOrder {
  id: string;
  orderNumber: string;
  patientId: string;
  patient?: Patient;
  specimenId?: string;
  specimen?: Specimen;
  clinicalOrderId?: string;
  testPanelId?: string;
  testPanel?: TestPanel;
  orderedById: string;
  orderedBy?: User;
  orderedAt: string;
  priority: OrderPriority;
  status: LabWorkOrderStatus;
  notes?: string;
  startTime?: string;
  completedTime?: string;
  verifiedById?: string;
  verifiedBy?: User;
  verifiedAt?: string;
  cancelledById?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  items?: LabWorkOrderItem[];
  results?: LabResult[];
  _count?: {
    results: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LabWorkOrderItem {
  id: string;
  workOrderId: string;
  testId: string;
  order: number;
  notes?: string;
  test?: LabTest;
}

export interface LabResult {
  id: string;
  workOrderId: string;
  workOrder?: LabWorkOrder;
  testId: string;
  test?: LabTest;
  patientId: string;
  patient?: Patient;
  value?: string;
  numericValue?: number;
  unit?: string;
  status: LabResultStatus;
  flag: LabResultFlag;
  referenceRange?: string;
  interpretation?: string;
  technicianId?: string;
  technician?: User;
  resultedAt?: string;
  reviewerId?: string;
  reviewer?: User;
  reviewedAt?: string;
  instrumentId?: string;
  method?: string;
  dilution?: number;
  comments?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReferenceRange {
  id: string;
  testId: string;
  test?: LabTest;
  gender?: Gender;
  ageMin?: number;
  ageMax?: number;
  lowValue?: number;
  highValue?: number;
  criticalLow?: number;
  criticalHigh?: number;
  isDefault: boolean;
  referenceText?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QCControl {
  id: string;
  testId: string;
  test?: LabTest;
  lotNumber: string;
  level: QCControlLevel;
  targetValue: number;
  acceptableRange: number;
  manufacturer?: string;
  expiryDate: string;
  isActive: boolean;
  results?: QCResult[];
  _count?: {
    results: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface QCResult {
  id: string;
  controlId: string;
  control?: QCControl;
  instrumentId?: string;
  resultValue: number;
  status: QCResultStatus;
  deviation?: number;
  runDate: string;
  technicianId?: string;
  technician?: User;
  reviewedById?: string;
  reviewedBy?: User;
  reviewedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// LIS API Request Types
export interface CreateLabTestRequest {
  code: string;
  name: string;
  category: LabTestCategory;
  description?: string;
  specimenType: SpecimenType;
  containerType?: string;
  volumeRequired?: number;
  turnaroundTime?: number;
  requiresFasting?: boolean;
  specialInstructions?: string;
}

export interface UpdateLabTestRequest extends Partial<CreateLabTestRequest> {}

export interface CreateTestPanelRequest {
  code: string;
  name: string;
  description?: string;
  testIds: string[];
}

export interface UpdateTestPanelRequest extends Partial<Omit<CreateTestPanelRequest, 'testIds'>> {
  testIds?: string[];
  isActive?: boolean;
}

export interface CreateSpecimenRequest {
  patientId: string;
  specimenType: SpecimenType;
  collectionSite?: string;
  volumeCollected?: number;
  collectionNotes?: string;
}

export interface ReceiveSpecimenRequest {
  receptionNotes?: string;
  storageLocation?: string;
}

export interface CreateLabWorkOrderRequest {
  patientId: string;
  specimenId?: string;
  clinicalOrderId?: string;
  testPanelId?: string;
  testIds?: string[];
  priority?: OrderPriority;
  notes?: string;
}

export interface UpdateLabWorkOrderRequest {
  status?: LabWorkOrderStatus;
  priority?: OrderPriority;
  notes?: string;
  cancellationReason?: string;
}

export interface VerifyLabWorkOrderRequest {
  notes?: string;
}

export interface CreateLabResultRequest {
  workOrderId: string;
  testId: string;
  value: string;
  numericValue?: number;
  unit?: string;
  referenceRange?: string;
  interpretation?: string;
  instrumentId?: string;
  method?: string;
  dilution?: number;
  comments?: string;
}

export interface UpdateLabResultRequest extends Partial<Omit<CreateLabResultRequest, 'workOrderId' | 'testId'>> {}

export interface ReviewLabResultRequest {
  notes?: string;
}

export interface CreateReferenceRangeRequest {
  testId: string;
  gender?: Gender;
  ageMin?: number;
  ageMax?: number;
  lowValue?: number;
  highValue?: number;
  criticalLow?: number;
  criticalHigh?: number;
  isDefault?: boolean;
  referenceText?: string;
}

export interface UpdateReferenceRangeRequest extends Partial<CreateReferenceRangeRequest> {}

export interface CreateQCControlRequest {
  testId: string;
  lotNumber: string;
  level?: QCControlLevel;
  targetValue: number;
  acceptableRange: number;
  manufacturer?: string;
  expiryDate: string;
}

export interface UpdateQCControlRequest extends Partial<CreateQCControlRequest> {}

export interface CreateQCResultRequest {
  controlId: string;
  instrumentId?: string;
  resultValue: number;
  notes?: string;
}

export interface ReviewQCResultRequest {
  notes?: string;
}

// ============================================
// RADIOLOGY / PACS Types
// ============================================

export type ImagingModality = 
  | 'XRAY' 
  | 'CT' 
  | 'MRI' 
  | 'ULTRASOUND' 
  | 'MAMMOGRAPHY' 
  | 'FLUOROSCOPY' 
  | 'PET' 
  | 'NUCLEAR_MEDICINE' 
  | 'ANGIOGRAPHY' 
  | 'DEXA';

export type ImagingStudyStatus = 
  | 'ORDERED' 
  | 'SCHEDULED' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'CANCELLED';

export type RadiologistReportStatus = 
  | 'DRAFT' 
  | 'PENDING_VERIFICATION' 
  | 'VERIFIED' 
  | 'AMENDED';

export interface ImagingStudy {
  id: string;
  patientId: string;
  patient?: Patient;
  accessionNumber: string;
  studyInstanceUid?: string;
  modality: ImagingModality;
  studyDescription?: string;
  bodyPart?: string;
  referringPhysicianId?: string;
  referringPhysician?: User;
  radiologistId?: string;
  radiologist?: User;
  technicianId?: string;
  technician?: User;
  scheduledDate?: string;
  performedDate?: string;
  status: ImagingStudyStatus;
  priority: OrderPriority;
  clinicalHistory?: string;
  indication?: string;
  contrastUsed: boolean;
  contrastType?: string;
  doseReport?: string;
  numberOfSeries: number;
  numberOfInstances: number;
  storageLocation?: string;
  dicomUrl?: string;
  notes?: string;
  series?: DicomSeries[];
  reports?: RadiologistReport[];
  _count?: {
    series: number;
    reports: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DicomSeries {
  id: string;
  studyId: string;
  study?: ImagingStudy;
  seriesInstanceUid: string;
  seriesNumber?: number;
  modality?: string;
  seriesDescription?: string;
  bodyPartExamined?: string;
  protocolName?: string;
  sliceThickness?: number;
  numberOfSlices: number;
  instances?: DicomInstance[];
  _count?: {
    instances: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DicomInstance {
  id: string;
  seriesId: string;
  series?: DicomSeries;
  sopInstanceUid: string;
  instanceNumber?: number;
  sopClassUid?: string;
  filePath: string;
  fileSize?: number;
  transferSyntaxUid?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RadiologistReport {
  id: string;
  studyId: string;
  study?: ImagingStudy;
  radiologistId: string;
  radiologist?: User;
  verifyingRadiologistId?: string;
  verifyingRadiologist?: User;
  status: RadiologistReportStatus;
  findings?: string;
  impression?: string;
  recommendations?: string;
  comparisonStudyId?: string;
  criticalFindings: boolean;
  notificationSent: boolean;
  reportedAt?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Radiology API Request Types
export interface CreateImagingStudyRequest {
  patientId: string;
  modality: ImagingModality;
  studyDescription: string;
  bodyPart?: string;
  referringPhysicianId?: string;
  scheduledDate?: string;
  priority?: OrderPriority;
  clinicalHistory?: string;
  indication?: string;
  contrastUsed?: boolean;
  contrastType?: string;
  notes?: string;
}

export interface UpdateImagingStudyRequest extends Partial<CreateImagingStudyRequest> {
  performedDate?: string;
  status?: ImagingStudyStatus;
  radiologistId?: string;
  technicianId?: string;
  doseReport?: string;
}

export interface CreateRadiologistReportRequest {
  studyId: string;
  findings: string;
  impression: string;
  recommendations?: string;
  comparisonStudyId?: string;
  criticalFindings?: boolean;
}

export interface UpdateRadiologistReportRequest extends Partial<Omit<CreateRadiologistReportRequest, 'studyId'>> {}

// ============================================
// EMERGENCY DEPARTMENT Types
// ============================================

export type EDVisitStatus = 
  | 'PENDING' 
  | 'TRIAGE' 
  | 'IN_PROGRESS' 
  | 'UNDER_OBSERVATION' 
  | 'WAITING_RESULTS' 
  | 'READY_FOR_DISCHARGE' 
  | 'DISCHARGED' 
  | 'ADMITTED' 
  | 'TRANSFERRED' 
  | 'LEFT_WITHOUT_BEING_SEEN' 
  | 'DECEASED';

export type ESI = 'ESI_1' | 'ESI_2' | 'ESI_3' | 'ESI_4' | 'ESI_5';

export type EDDisposition = 
  | 'DISCHARGE_HOME' 
  | 'ADMIT_TO_WARD' 
  | 'ADMIT_TO_ICU' 
  | 'TRANSFER_TO_ANOTHER_HOSPITAL' 
  | 'TRANSFER_TO_ANOTHER_ED' 
  | 'LEAVE_AMA' 
  | 'DEATH';

export interface EDVisit {
  id: string;
  patientId: string;
  patient?: Patient;
  visitNumber: string;
  arrivalTime: string;
  chiefComplaint: string;
  arrivalMode?: string;
  ageAtVisit: number;
  genderAtVisit: string;
  triageLevel?: ESI;
  triageTime?: string;
  triageNurseId?: string;
  triageNurse?: User;
  triageTemperature?: number;
  triageHeartRate?: number;
  triageRespiratoryRate?: number;
  triageBloodPressure?: string;
  triageOxygenSaturation?: number;
  triagePainScore?: number;
  triageGlasgowComaScore?: number;
  currentStatus: EDVisitStatus;
  assignedProviderId?: string;
  assignedProvider?: User;
  bedAssignment?: string;
  bedAssignmentTime?: string;
  historyOfPresentIllness?: string;
  physicalExamination?: string;
  differentialDiagnosis?: string;
  finalDiagnosis?: string;
  labsOrdered?: string;
  imagingOrdered?: string;
  proceduresPerformed?: string;
  medicationsGiven?: string;
  providerFirstContactTime?: string;
  roomAssignmentTime?: string;
  firstLabResultsTime?: string;
  firstImagingResultsTime?: string;
  dispositionDecisionTime?: string;
  dischargeTime?: string;
  disposition?: EDDisposition;
  dispositionNotes?: string;
  consultationsRequested?: string;
  cardiacArrest: boolean;
  intubationPerformed: boolean;
  cprPerformed: boolean;
  followUpInstructions?: string;
  followUpRecommended: boolean;
  followUpWithin?: string;
  notes?: string;
  triageEvents?: EDTriage[];
  procedures?: EDProcedure[];
  flowRecords?: EDFlow[];
  _count?: {
    procedures: number;
    flowRecords: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EDTriage {
  id: string;
  visitId: string;
  visit?: EDVisit;
  triageNurseId: string;
  triageNurse?: User;
  triageTime: string;
  triageLevel: ESI;
  temperature?: number;
  heartRate?: number;
  respiratoryRate?: number;
  bloodPressure?: string;
  oxygenSaturation?: number;
  painScore?: number;
  weight?: number;
  height?: number;
  chiefComplaint: string;
  historyOfPresentIllness?: string;
  immunocompromised: boolean;
  pregnancyStatus?: string;
  allergies?: string;
  currentMedications?: string;
  psychiatricHold: boolean;
  isolationRequired: boolean;
  isolationType?: string;
  triageNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export type EDProcedureType = 
  | 'INTUBATION' 
  | 'CENTRAL_LINE' 
  | 'ARTERIAL_LINE' 
  | 'CHEST_TUBE' 
  | 'LUMBAR_PUNCTURE' 
  | 'THORACENTESIS' 
  | 'PARACENTESIS' 
  | 'JOINT_ASPIRATION' 
  | 'FRACTURE_REDUCTION' 
  | 'SUTURING' 
  | 'INCISION_DRAINAGE' 
  | 'CARDIOVERSION' 
  | 'DEFIBRILLATION' 
  | 'CPR' 
  | 'OTHER';

export interface EDProcedure {
  id: string;
  visitId: string;
  visit?: EDVisit;
  procedureType: EDProcedureType;
  procedureTime: string;
  performedById: string;
  performedBy?: User;
  assistedById?: string;
  assistedBy?: User;
  procedureDescription: string;
  indication?: string;
  complications?: string;
  sedationUsed: boolean;
  sedationType?: string;
  anesthesiaProviderId?: string;
  outcome?: string;
  specimenCollected: boolean;
  specimenType?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type EDFlowStatus = 
  | 'WAITING' 
  | 'IN_TREATMENT' 
  | 'AWAITING_RESULTS' 
  | 'AWAITING_CONSULT' 
  | 'AWAITING_BED' 
  | 'DISPOSITION_DECIDED';

export interface EDFlow {
  id: string;
  visitId: string;
  visit?: EDVisit;
  timestamp: string;
  status: EDFlowStatus;
  location?: string;
  providerId?: string;
  provider?: User;
  clinicalNotes?: string;
  plan?: string;
  labsOrdered: boolean;
  imagingOrdered: boolean;
  medicationsOrdered: boolean;
  consultOrdered: boolean;
  labResultsAvailable: boolean;
  imagingResultsAvailable: boolean;
  timeInThisStatus?: number;
  createdAt: string;
  updatedAt: string;
}

// Emergency Department API Request Types
export interface CreateEDVisitRequest {
  patientId: string;
  chiefComplaint: string;
  arrivalMode?: string;
  historyOfPresentIllness?: string;
  allergies?: string;
  currentMedications?: string;
}

export interface UpdateEDVisitRequest extends Partial<CreateEDVisitRequest> {
  currentStatus?: EDVisitStatus;
  triageLevel?: ESI;
  triageTime?: string;
  triageNurseId?: string;
  triageTemperature?: number;
  triageHeartRate?: number;
  triageRespiratoryRate?: number;
  triageBloodPressure?: string;
  triageOxygenSaturation?: number;
  triagePainScore?: number;
  triageGlasgowComaScore?: number;
  assignedProviderId?: string;
  bedAssignment?: string;
  bedAssignmentTime?: string;
  physicalExamination?: string;
  differentialDiagnosis?: string;
  finalDiagnosis?: string;
  labsOrdered?: string;
  imagingOrdered?: string;
  proceduresPerformed?: string;
  medicationsGiven?: string;
  providerFirstContactTime?: string;
  roomAssignmentTime?: string;
  firstLabResultsTime?: string;
  firstImagingResultsTime?: string;
  dispositionDecisionTime?: string;
  dischargeTime?: string;
  disposition?: EDDisposition;
  dispositionNotes?: string;
  consultationsRequested?: string;
  cardiacArrest?: boolean;
  intubationPerformed?: boolean;
  cprPerformed?: boolean;
  followUpInstructions?: string;
  followUpRecommended?: boolean;
  followUpWithin?: string;
  notes?: string;
}

// ============================================
// ICU / CRITICAL CARE Types
// ============================================

export type IcuAdmissionStatus = 
  | 'ADMITTED' 
  | 'CRITICAL' 
  | 'STABLE' 
  | 'IMPROVING' 
  | 'DETERIORATING' 
  | 'DISCHARGED' 
  | 'DECEASED';

export type IcuAdmissionSource = 
  | 'ED' 
  | 'OR' 
  | 'WARD' 
  | 'ANOTHER_HOSPITAL' 
  | 'DIRECT_ADMISSION';

export type VentilatorMode = 
  | 'AC_VC' 
  | 'AC_PC' 
  | 'SIMV' 
  | 'CPAP' 
  | 'PS' 
  | 'BiPAP' 
  | 'APRV' 
  | 'PRVC' 
  | 'OTHER';

export interface IcuAdmission {
  id: string;
  patientId: string;
  patient?: Patient;
  admissionNumber: string;
  admissionDate: string;
  admissionSource: IcuAdmissionSource;
  admittingProviderId: string;
  admittingProvider?: User;
  bedId?: string;
  bedNumber?: string;
  apacheIIScore?: number;
  apacheIICalculatedAt?: string;
  primaryDiagnosis: string;
  secondaryDiagnoses?: string;
  admissionReason?: string;
  currentStatus: IcuAdmissionStatus;
  isVentilated: boolean;
  isSedated: boolean;
  isIsolated: boolean;
  isolationType?: string;
  expectedLos?: number;
  dischargeDate?: string;
  dischargeDisposition?: string;
  dischargeProviderId?: string;
  dischargeProvider?: User;
  icuLos?: number;
  hospitalLos?: number;
  diedInIcu: boolean;
  admissionNotes?: string;
  dischargeNotes?: string;
  vitalSigns?: IcuVitalSign[];
  ventilatorSettings?: VentilatorSetting[];
  sedationAssessments?: SedationAssessment[];
  linesTubesDrains?: LinesTubesDrains[];
  fluidBalances?: FluidBalance[];
  flowsheets?: IcuFlowsheet[];
  dailyGoals?: IcuDailyGoal[];
  _count?: {
    vitalSigns: number;
    ventilatorSettings: number;
    linesTubesDrains: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface IcuVitalSign {
  id: string;
  admissionId: string;
  admission?: IcuAdmission;
  recordedAt: string;
  recordedById: string;
  recordedBy?: User;
  heartRate?: number;
  systolicBP?: number;
  diastolicBP?: number;
  meanArterialPressure?: number;
  respiratoryRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  gcsEye?: number;
  gcsVerbal?: number;
  gcsMotor?: number;
  gcsTotal?: number;
  cvp?: number;
  papSystolic?: number;
  papDiastolic?: number;
  pcwp?: number;
  cardiacOutput?: number;
  cardiacIndex?: number;
  painScore?: number;
  isCritical: boolean;
  criticalAlerts?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VentilatorSetting {
  id: string;
  admissionId: string;
  admission?: IcuAdmission;
  recordedAt: string;
  recordedById: string;
  recordedBy?: User;
  ventilatorMode: VentilatorMode;
  fio2: number;
  peep?: number;
  tidalVolume?: number;
  respiratoryRate?: number;
  pressureSupport?: number;
  peakPressure?: number;
  plateauPressure?: number;
  ieRatio?: string;
  inspiratoryTime?: number;
  flowRate?: number;
  sensitivity?: number;
  rsbi?: number;
  nif?: number;
  spontaneousVt?: number;
  spontaneousRate?: number;
  isExtubated: boolean;
  extubationDate?: string;
  extubationNotes?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SedationAssessment {
  id: string;
  admissionId: string;
  admission?: IcuAdmission;
  assessedAt: string;
  assessedById: string;
  assessedBy?: User;
  rassScore: number;
  camIcuPositive?: boolean;
  camIcuFeature1?: boolean;
  camIcuFeature2?: boolean;
  camIcuFeature3?: boolean;
  camIcuFeature4?: boolean;
  painScore?: number;
  painScale?: string;
  sedationMedications?: string;
  sedationGoal?: string;
  deliriumManagement?: string;
  restraintsUsed: boolean;
  restraintType?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LinesTubesDrains {
  id: string;
  admissionId: string;
  admission?: IcuAdmission;
  deviceType: string;
  deviceSubtype: string;
  insertedAt: string;
  insertedById: string;
  insertedBy?: User;
  insertionSite?: string;
  insertionNotes?: string;
  size?: string;
  length?: string;
  numberOfLumens?: number;
  dressingChangeDate?: string;
  tubingChangeDate?: string;
  removedAt?: string;
  removedById?: string;
  removedBy?: User;
  removalReason?: string;
  complications?: string;
  infectionSigns: boolean;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FluidBalance {
  id: string;
  admissionId: string;
  admission?: IcuAdmission;
  recordedAt: string;
  recordedById: string;
  recordedBy?: User;
  periodStart: string;
  periodEnd: string;
  ivFluids: number;
  enteralFeeds: number;
  oralIntake: number;
  bloodProducts: number;
  medications: number;
  otherIntake: number;
  totalIntake: number;
  urineOutput: number;
  ngTubeDrainage: number;
  chestTubeDrainage: number;
  stool: number;
  woundDrainage: number;
  otherOutput: number;
  totalOutput: number;
  balance: number;
  cumulativeBalance: number;
  urineColor?: string;
  urineClarity?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IcuFlowsheet {
  id: string;
  admissionId: string;
  admission?: IcuAdmission;
  recordedAt: string;
  recordedById: string;
  recordedBy?: User;
  shift: string;
  activityLevel?: string;
  position?: string;
  turnsPerformed: number;
  skinAssessment?: string;
  pressureUlcerRisk?: string;
  fallRisk?: string;
  restraintsChecked: boolean;
  linesChecked: boolean;
  tubesChecked: boolean;
  bathType?: string;
  oralCare: boolean;
  eyeCare: boolean;
  familyUpdated: boolean;
  familyUpdateNotes?: string;
  events?: string;
  planForNextShift?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IcuDailyGoal {
  id: string;
  admissionId: string;
  admission?: IcuAdmission;
  goalDate: string;
  createdById: string;
  createdBy?: User;
  patientStatus?: string;
  overnightEvents?: string;
  ventilationGoal?: string;
  sedationGoal?: string;
  mobilityGoal?: string;
  nutritionGoal?: string;
  liberationTrial: boolean;
  liberationTrialTime?: string;
  extubationGoal: boolean;
  dvtProphylaxis: boolean;
  pepticUlcerProphylaxis: boolean;
  familyCommunication?: string;
  familyMeetingScheduled: boolean;
  familyMeetingTime?: string;
  dischargeAnticipatedDate?: string;
  dischargeDispositionPlanned?: string;
  actionItems?: string;
  goalsMet?: boolean;
  barriersToGoals?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ICU / Critical Care API Request Types
export interface CreateIcuAdmissionRequest {
  patientId: string;
  admissionSource: IcuAdmissionSource;
  admittingProviderId: string;
  bedId?: string;
  bedNumber?: string;
  primaryDiagnosis: string;
  secondaryDiagnoses?: string;
  admissionReason?: string;
  expectedLos?: number;
  admissionNotes?: string;
  isIsolated?: boolean;
  isolationType?: string;
}

export interface UpdateIcuAdmissionRequest extends Partial<Omit<CreateIcuAdmissionRequest, 'patientId'>> {
  currentStatus?: IcuAdmissionStatus;
  apacheIIScore?: number;
  isVentilated?: boolean;
  isSedated?: boolean;
  dischargeDate?: string;
  dischargeDisposition?: string;
  dischargeProviderId?: string;
  dischargeNotes?: string;
  icuLos?: number;
  hospitalLos?: number;
  diedInIcu?: boolean;
}

// ============================================
// BLOOD BANK Types
// ============================================

export type BloodTypeBB = 
  | 'A_POSITIVE' 
  | 'A_NEGATIVE' 
  | 'B_POSITIVE' 
  | 'B_NEGATIVE' 
  | 'AB_POSITIVE' 
  | 'AB_NEGATIVE' 
  | 'O_POSITIVE' 
  | 'O_NEGATIVE';

export type BloodProductType = 
  | 'WHOLE_BLOOD' 
  | 'PRBC' 
  | 'FFP' 
  | 'PLATELETS' 
  | 'CRYOPRECIPITATE' 
  | 'GRANULOCYTES' 
  | 'ALBUMIN' 
  | 'IVIG';

export type BloodProductStatus = 
  | 'AVAILABLE' 
  | 'RESERVED' 
  | 'QUARANTINE' 
  | 'EXPIRED' 
  | 'DISCARDED' 
  | 'TRANSFUSED';

export interface BloodProduct {
  id: string;
  productCode: string;
  productType: BloodProductType;
  bloodType: BloodTypeBB;
  donationId: string;
  donation?: {
    donor?: {
      firstName: string;
      lastName: string;
      donorId: string;
    };
  };
  volume: number;
  collectionDate: string;
  expirationDate: string;
  storageLocation?: string;
  storageTemp?: number;
  status: BloodProductStatus;
  reservedForId?: string;
  reservedFor?: Patient;
  reservedUntil?: string;
  qcPassed: boolean;
  qcDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBloodProductRequest {
  donationId: string;
  productType: BloodProductType;
  bloodType: BloodTypeBB;
  volume: number;
  storageLocation?: string;
  storageTemp?: number;
  notes?: string;
}

export interface UpdateBloodProductRequest {
  status?: BloodProductStatus;
  storageLocation?: string;
  storageTemp?: number;
  reservedForId?: string;
  reservedUntil?: string;
  qcPassed?: boolean;
  notes?: string;
}
