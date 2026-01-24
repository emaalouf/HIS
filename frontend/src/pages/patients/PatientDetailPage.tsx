import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { patientService } from '../../services/patient.service';
import { dialysisService } from '../../services/dialysis.service';
import { dialysisPrescriptionService } from '../../services/dialysis-prescription.service';
import { cardiologyService } from '../../services/cardiology.service';
import { cardiologyDeviceService } from '../../services/cardiology-device.service';
import { cardiologyMedicationService } from '../../services/cardiology-medication.service';
import { cardiologyLabService } from '../../services/cardiology-lab.service';
import { nephrologyService } from '../../services/nephrology.service';
import { nephrologyLabService } from '../../services/nephrology-lab.service';
import { neurologyService } from '../../services/neurology.service';
import { Card, CardContent, CardHeader, CardTitle, Button } from '../../components/ui';
import { formatDate, formatDateTime, calculateAge, formatBloodType } from '../../lib/utils';
import {
    ArrowLeft,
    Phone,
    Mail,
    MapPin,
    AlertCircle,
    Stethoscope,
    Edit,
    User,
    Heart,
    Calendar,
    Droplet,
    HeartPulse,
    Filter,
    Brain,
} from 'lucide-react';

export function PatientDetailPage() {
    const { id } = useParams<{ id: string }>();

    const { data: patient, isLoading } = useQuery({
        queryKey: ['patient', id],
        queryFn: () => patientService.getPatient(id!),
        enabled: !!id,
    });

    const { data: dialysisSessions } = useQuery({
        queryKey: ['dialysis-sessions', 'patient', id],
        queryFn: () =>
            dialysisService.getSessions({
                patientId: id!,
                limit: 5,
                sortBy: 'startTime',
                sortOrder: 'desc',
            }),
        enabled: !!id,
    });

    const { data: dialysisPrescriptions } = useQuery({
        queryKey: ['dialysis-prescriptions', 'patient', id],
        queryFn: () =>
            dialysisPrescriptionService.getPrescriptions({
                patientId: id!,
                limit: 1,
                isActive: true,
                sortBy: 'startDate',
                sortOrder: 'desc',
            }),
        enabled: !!id,
    });

    const { data: cardiologyVisits } = useQuery({
        queryKey: ['cardiology-visits', 'patient', id],
        queryFn: () =>
            cardiologyService.getVisits({
                patientId: id!,
                limit: 1,
                sortBy: 'visitDate',
                sortOrder: 'desc',
            }),
        enabled: !!id,
    });

    const { data: upcomingCardiologyVisits } = useQuery({
        queryKey: ['cardiology-visits', 'patient-upcoming', id],
        queryFn: () =>
            cardiologyService.getVisits({
                patientId: id!,
                status: 'SCHEDULED',
                startDate: new Date().toISOString(),
                limit: 1,
                sortBy: 'visitDate',
                sortOrder: 'asc',
            }),
        enabled: !!id,
    });

    const { data: cardiologyDevices } = useQuery({
        queryKey: ['cardiology-devices', 'patient', id],
        queryFn: () =>
            cardiologyDeviceService.getDevices({
                patientId: id!,
                status: 'ACTIVE',
                limit: 1,
            }),
        enabled: !!id,
    });

    const { data: cardiologyMedications } = useQuery({
        queryKey: ['cardiology-medications', 'patient', id],
        queryFn: () =>
            cardiologyMedicationService.getOrders({
                patientId: id!,
                isActive: true,
                limit: 1,
            }),
        enabled: !!id,
    });

    const { data: cardiologyLabs } = useQuery({
        queryKey: ['cardiology-labs', 'patient', id],
        queryFn: () =>
            cardiologyLabService.getResults({
                patientId: id!,
                limit: 1,
                sortBy: 'collectedAt',
                sortOrder: 'desc',
        }),
        enabled: !!id,
    });

    const { data: nephrologyVisits } = useQuery({
        queryKey: ['nephrology-visits', 'patient', id],
        queryFn: () =>
            nephrologyService.getVisits({
                patientId: id!,
                limit: 1,
                sortBy: 'visitDate',
                sortOrder: 'desc',
            }),
        enabled: !!id,
    });

    const { data: nephrologyLabs } = useQuery({
        queryKey: ['nephrology-labs', 'patient', id],
        queryFn: () =>
            nephrologyLabService.getResults({
                patientId: id!,
                limit: 1,
                sortBy: 'collectedAt',
                sortOrder: 'desc',
            }),
        enabled: !!id,
    });

    const { data: neurologyVisits } = useQuery({
        queryKey: ['neurology-visits', 'patient', id],
        queryFn: () =>
            neurologyService.getVisits({
                patientId: id!,
                limit: 1,
                sortBy: 'visitDate',
                sortOrder: 'desc',
            }),
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Patient not found</p>
                <Link to="/patients" className="text-blue-600 hover:underline mt-2 inline-block">
                    Back to patients
                </Link>
            </div>
        );
    }

    const allergies = Array.isArray(patient.allergies) ? patient.allergies :
        (typeof patient.allergies === 'string' ? JSON.parse(patient.allergies || '[]') : []);
    const conditions = Array.isArray(patient.chronicConditions) ? patient.chronicConditions :
        (typeof patient.chronicConditions === 'string' ? JSON.parse(patient.chronicConditions || '[]') : []);
    const activePrescription = dialysisPrescriptions?.prescriptions?.[0];
    const recentSessions = dialysisSessions?.sessions ?? [];
    const accessType = activePrescription?.accessType || recentSessions[0]?.accessType;
    const latestCardiologyVisit = cardiologyVisits?.visits?.[0];
    const upcomingCardiologyVisit = upcomingCardiologyVisits?.visits?.[0];
    const latestCardiologyLab = cardiologyLabs?.results?.[0];
    const activeDeviceCount = cardiologyDevices?.pagination?.total;
    const activeMedicationCount = cardiologyMedications?.pagination?.total;
    const latestNephrologyVisit = nephrologyVisits?.visits?.[0];
    const latestNephrologyLab = nephrologyLabs?.results?.[0];
    const latestNeurologyVisit = neurologyVisits?.visits?.[0];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/patients">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft size={18} className="mr-2" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {patient.firstName} {patient.lastName}
                        </h1>
                        <p className="text-gray-500">MRN: {patient.mrn}</p>
                    </div>
                </div>
                <Link to={`/patients/${id}/edit`}>
                    <Button variant="outline">
                        <Edit size={18} className="mr-2" />
                        Edit
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Demographics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User size={20} />
                                Demographics
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div>
                                    <p className="text-sm text-gray-500">Date of Birth</p>
                                    <p className="font-medium flex items-center gap-2">
                                        <Calendar size={16} className="text-gray-400" />
                                        {formatDate(patient.dateOfBirth)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Age</p>
                                    <p className="font-medium">{calculateAge(patient.dateOfBirth)} years</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Gender</p>
                                    <p className="font-medium">{patient.gender}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Blood Type</p>
                                    <p className="font-medium">
                                        <span className="px-2 py-1 bg-red-50 text-red-700 rounded text-sm">
                                            {formatBloodType(patient.bloodType)}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Phone size={20} />
                                Contact Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Phone size={18} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <p className="font-medium">{patient.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Mail size={18} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium">{patient.email || '-'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 md:col-span-2">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <MapPin size={18} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Address</p>
                                        <p className="font-medium">
                                            {[patient.address, patient.city, patient.country].filter(Boolean).join(', ') || '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Medical History */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Stethoscope size={20} />
                                Medical History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {patient.medicalHistories && patient.medicalHistories.length > 0 ? (
                                <div className="space-y-4">
                                    {patient.medicalHistories.map((history) => (
                                        <div key={history.id} className="border-l-4 border-blue-500 pl-4 py-2">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium text-gray-900">{history.diagnosis}</p>
                                                <span className="text-sm text-gray-500">{formatDate(history.visitDate)}</span>
                                            </div>
                                            {history.treatment && (
                                                <p className="text-sm text-gray-600 mt-1">Treatment: {history.treatment}</p>
                                            )}
                                            {history.notes && (
                                                <p className="text-sm text-gray-500 mt-1">{history.notes}</p>
                                            )}
                                            {history.doctor && (
                                                <p className="text-xs text-gray-400 mt-2">
                                                    Dr. {history.doctor.firstName} {history.doctor.lastName}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-6">No medical history recorded</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Dialysis Overview */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Droplet size={20} />
                                Dialysis Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-500 mb-3">Current Prescription</p>
                                    {activePrescription ? (
                                        <div className="space-y-2 text-sm text-gray-700">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">Dialyzer</span>
                                                <span>{activePrescription.dialyzer || '-'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">Dialysate</span>
                                                <span>{activePrescription.dialysate || '-'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">Duration</span>
                                                <span>{activePrescription.durationMinutes ? `${activePrescription.durationMinutes} min` : '-'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">Dry Weight</span>
                                                <span>{activePrescription.dryWeight ?? '-'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">Target UF</span>
                                                <span>{activePrescription.targetUltrafiltration ?? '-'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">Access Type</span>
                                                <span>{accessType || '-'}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">No active prescription on file.</p>
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-sm text-gray-500">Recent Sessions</p>
                                        {id && (
                                            <Link to={`/dialysis?patientId=${id}`} className="text-sm text-blue-600 hover:underline">
                                                View all
                                            </Link>
                                        )}
                                    </div>
                                    {recentSessions.length > 0 ? (
                                        <div className="space-y-3">
                                            {recentSessions.slice(0, 3).map((session) => (
                                                <div key={session.id} className="flex items-center justify-between text-sm">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{formatDateTime(session.startTime)}</p>
                                                        <p className="text-xs text-gray-500">{session.accessType || 'Access: N/A'}</p>
                                                    </div>
                                                    <span className="text-xs text-gray-500">{session.status}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">No recent sessions.</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Cardiology Overview */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <HeartPulse size={20} />
                                Cardiology Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-sm text-gray-500">Latest Visit</p>
                                        {id && (
                                            <Link to={`/cardiology?patientId=${id}`} className="text-sm text-rose-600 hover:underline">
                                                View all
                                            </Link>
                                        )}
                                    </div>
                                    {latestCardiologyVisit ? (
                                        <div className="space-y-2 text-sm text-gray-700">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">Date</span>
                                                <span>{formatDateTime(latestCardiologyVisit.visitDate)}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">Reason</span>
                                                <span>{latestCardiologyVisit.reason || '-'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">Diagnosis</span>
                                                <span>{latestCardiologyVisit.diagnosis || '-'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">Status</span>
                                                <span>{latestCardiologyVisit.status.split('_').join(' ')}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">No cardiology visits on file.</p>
                                    )}
                                    <div className="mt-4 border-t border-gray-100 pt-4">
                                        <p className="text-sm text-gray-500 mb-2">Next Scheduled</p>
                                        {upcomingCardiologyVisit ? (
                                            <div className="text-sm text-gray-700">
                                                <p className="font-medium">{formatDateTime(upcomingCardiologyVisit.visitDate)}</p>
                                                <p className="text-xs text-gray-500">{upcomingCardiologyVisit.reason || 'No reason listed'}</p>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500">No upcoming cardiology visits.</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-3">Care Snapshot</p>
                                    <div className="space-y-2 text-sm text-gray-700">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500">Active Devices</span>
                                            <span>{activeDeviceCount ?? '--'}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500">Active Medications</span>
                                            <span>{activeMedicationCount ?? '--'}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500">Last Troponin</span>
                                            <span>{latestCardiologyLab?.troponin ?? '--'}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500">Last BNP</span>
                                            <span>{latestCardiologyLab?.bnp ?? '--'}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500">Last LDL</span>
                                            <span>{latestCardiologyLab?.ldl ?? '--'}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500">Last Lab Date</span>
                                            <span>{latestCardiologyLab ? formatDateTime(latestCardiologyLab.collectedAt) : '--'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Nephrology Overview */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Filter size={20} />
                                Nephrology Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-sm text-gray-500">Latest Visit</p>
                                        {id && (
                                            <Link to={`/nephrology?patientId=${id}`} className="text-sm text-emerald-600 hover:underline">
                                                View all
                                            </Link>
                                        )}
                                    </div>
                                    {latestNephrologyVisit ? (
                                        <div className="space-y-2 text-sm text-gray-700">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">Date</span>
                                                <span>{formatDateTime(latestNephrologyVisit.visitDate)}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">CKD Stage</span>
                                                <span>{latestNephrologyVisit.ckdStage?.replace('_', ' ') || '--'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">eGFR</span>
                                                <span>{latestNephrologyVisit.egfr ?? '--'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">Status</span>
                                                <span>{latestNephrologyVisit.status.split('_').join(' ')}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">No nephrology visits on file.</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-3">Latest Labs</p>
                                    <div className="space-y-2 text-sm text-gray-700">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500">Creatinine</span>
                                            <span>{latestNephrologyLab?.creatinine ?? '--'}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500">eGFR</span>
                                            <span>{latestNephrologyLab?.egfr ?? '--'}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500">Potassium</span>
                                            <span>{latestNephrologyLab?.potassium ?? '--'}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500">Last Lab Date</span>
                                            <span>{latestNephrologyLab ? formatDateTime(latestNephrologyLab.collectedAt) : '--'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Neurology Overview */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Brain size={20} />
                                Neurology Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-sm text-gray-500">Latest Visit</p>
                                        {id && (
                                            <Link to={`/neurology?patientId=${id}`} className="text-sm text-sky-600 hover:underline">
                                                View all
                                            </Link>
                                        )}
                                    </div>
                                    {latestNeurologyVisit ? (
                                        <div className="space-y-2 text-sm text-gray-700">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">Date</span>
                                                <span>{formatDateTime(latestNeurologyVisit.visitDate)}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">Reason</span>
                                                <span>{latestNeurologyVisit.reason || '-'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">Diagnosis</span>
                                                <span>{latestNeurologyVisit.diagnosis || '-'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">Status</span>
                                                <span>{latestNeurologyVisit.status.split('_').join(' ')}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">No neurology visits on file.</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-3">Score Snapshot</p>
                                    <div className="space-y-2 text-sm text-gray-700">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500">NIHSS</span>
                                            <span>{latestNeurologyVisit?.nihssScore ?? '--'}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500">GCS</span>
                                            <span>{latestNeurologyVisit?.gcsScore ?? '--'}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500">Mental Status</span>
                                            <span>{latestNeurologyVisit?.mentalStatus || '--'}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500">Cranial Nerves</span>
                                            <span>{latestNeurologyVisit?.cranialNerves || '--'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Emergency Contact */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-600">
                                <AlertCircle size={20} />
                                Emergency Contact
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {patient.emergencyContactName ? (
                                <div className="space-y-2">
                                    <p className="font-medium">{patient.emergencyContactName}</p>
                                    <p className="text-sm text-gray-500">{patient.emergencyContactRelation || 'Contact'}</p>
                                    <p className="text-sm">{patient.emergencyContactPhone}</p>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No emergency contact on file</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Allergies */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-orange-600">
                                <AlertCircle size={20} />
                                Allergies
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {allergies.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {allergies.map((allergy: string, idx: number) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
                                        >
                                            {allergy}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No known allergies</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Chronic Conditions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-purple-600">
                                <Heart size={20} />
                                Chronic Conditions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {conditions.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {conditions.map((condition: string, idx: number) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                                        >
                                            {condition}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No chronic conditions</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
