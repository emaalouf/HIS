import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { patientService } from '../../services/patient.service';
import { dialysisService } from '../../services/dialysis.service';
import { dialysisPrescriptionService } from '../../services/dialysis-prescription.service';
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
