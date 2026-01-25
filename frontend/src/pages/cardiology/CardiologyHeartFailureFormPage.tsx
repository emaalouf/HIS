import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cardiologyHeartFailureService } from '../../services/cardiology-heart-failure.service';
import { cardiologyService } from '../../services/cardiology.service';
import { providerService } from '../../services/provider.service';
import { patientService } from '../../services/patient.service';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, SearchableSelect } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import type { CardiologyTestStatus, CreateCardiologyHeartFailureRequest, HeartFailureStage, NYHAClass } from '../../types';
import type { SelectOption } from '../../components/ui/SearchableSelect';
import { formatDateTime } from '../../lib/utils';
import { CardiologyNav } from './CardiologyNav';

const statusOptions: CardiologyTestStatus[] = [
    'ORDERED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
];

const nyhaClassOptions: NYHAClass[] = [
    'CLASS_I',
    'CLASS_II',
    'CLASS_III',
    'CLASS_IV',
];

const heartFailureStageOptions: HeartFailureStage[] = [
    'STAGE_A',
    'STAGE_B',
    'STAGE_C',
    'STAGE_D',
];

const formatDateTimeLocal = (value: Date) => {
    const local = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
};

type HeartFailureFormState = {
    patientId: string;
    providerId: string;
    visitId: string;
    assessmentDate: string;
    status: CardiologyTestStatus;
    etiology: string;
    nyhaClass: string;
    heartFailureStage: string;
    lvef: string;
    symptoms: string;
    medications: string;
    mechanicalSupport: string;
    transplantStatus: string;
    implantableDevices: string;
    rehospitalizations: string;
    lastHospitalization: string;
    bnp: string;
    ntProBnp: string;
    assessment: string;
    plan: string;
    nextFollowUpDate: string;
    notes: string;
};

export function CardiologyHeartFailureFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const isEditMode = Boolean(id);
    const [patientInput, setPatientInput] = useState('');
    const [providerInput, setProviderInput] = useState('');
    const [visitInput, setVisitInput] = useState('');

    const defaultAssessmentDate = useMemo(() => formatDateTimeLocal(new Date()), []);

    const [formData, setFormData] = useState<HeartFailureFormState>({
        patientId: '',
        providerId: '',
        visitId: '',
        assessmentDate: defaultAssessmentDate,
        status: 'ORDERED',
        etiology: '',
        nyhaClass: '',
        heartFailureStage: '',
        lvef: '',
        symptoms: '',
        medications: '',
        mechanicalSupport: '',
        transplantStatus: '',
        implantableDevices: '',
        rehospitalizations: '',
        lastHospitalization: '',
        bnp: '',
        ntProBnp: '',
        assessment: '',
        plan: '',
        nextFollowUpDate: '',
        notes: '',
    });

    const { data: assessment, isLoading } = useQuery({
        queryKey: ['cardiology-heart-failure', id],
        queryFn: () => cardiologyHeartFailureService.getAssessment(id!),
        enabled: isEditMode,
    });

    const patientSearch = patientInput.trim();
    const providerSearch = providerInput.trim();
    const visitSearch = visitInput.trim();

    const { data: patientsData, isLoading: isPatientsLoading } = useQuery({
        queryKey: ['patients', 'heart-failure-picker', patientSearch],
        queryFn: () =>
            patientService.getPatients({
                page: 1,
                limit: 10,
                search: patientSearch || undefined,
                sortBy: patientSearch ? undefined : 'createdAt',
                sortOrder: patientSearch ? undefined : 'desc',
            }),
    });

    const { data: providersData, isLoading: isProvidersLoading } = useQuery({
        queryKey: ['providers', 'heart-failure-picker', providerSearch],
        queryFn: () =>
            providerService.getProviders({
                page: 1,
                limit: 10,
                search: providerSearch || undefined,
                sortBy: providerSearch ? undefined : 'createdAt',
                sortOrder: providerSearch ? undefined : 'desc',
            }),
    });

    const { data: visitsData, isLoading: isVisitsLoading } = useQuery({
        queryKey: ['cardiology-visits', 'heart-failure-picker', visitSearch],
        queryFn: () =>
            cardiologyService.getVisits({
                page: 1,
                limit: 10,
                search: visitSearch || undefined,
            }),
    });

    useEffect(() => {
        if (!assessment) return;
        setFormData({
            patientId: assessment.patientId,
            providerId: assessment.providerId || '',
            visitId: assessment.visitId || '',
            assessmentDate: formatDateTimeLocal(new Date(assessment.assessmentDate)),
            status: assessment.status,
            etiology: assessment.etiology || '',
            nyhaClass: assessment.nyhaClass || '',
            heartFailureStage: assessment.heartFailureStage || '',
            lvef: assessment.lvef?.toString() || '',
            symptoms: assessment.symptoms || '',
            medications: assessment.medications || '',
            mechanicalSupport: assessment.mechanicalSupport || '',
            transplantStatus: assessment.transplantStatus || '',
            implantableDevices: assessment.implantableDevices || '',
            rehospitalizations: assessment.rehospitalizations?.toString() || '',
            lastHospitalization: assessment.lastHospitalization ? formatDateTimeLocal(new Date(assessment.lastHospitalization)) : '',
            bnp: assessment.bnp?.toString() || '',
            ntProBnp: assessment.ntProBnp?.toString() || '',
            assessment: assessment.assessment || '',
            plan: assessment.plan || '',
            nextFollowUpDate: assessment.nextFollowUpDate ? formatDateTimeLocal(new Date(assessment.nextFollowUpDate)) : '',
            notes: assessment.notes || '',
        });
        if (assessment.patient) {
            setPatientInput(`${assessment.patient.firstName} ${assessment.patient.lastName}`);
        } else {
            setPatientInput(assessment.patientId);
        }
        if (assessment.provider) {
            const prefix = assessment.provider.role === 'DOCTOR' ? 'Dr. ' : '';
            setProviderInput(`${prefix}${assessment.provider.firstName} ${assessment.provider.lastName}`);
        } else if (assessment.providerId) {
            setProviderInput(assessment.providerId);
        }
        if (assessment.visit) {
            setVisitInput(`${formatDateTime(assessment.visit.visitDate)} · ${assessment.visit.id}`);
        } else if (assessment.visitId) {
            setVisitInput(assessment.visitId);
        }
    }, [assessment]);

    const createMutation = useMutation({
        mutationFn: (payload: CreateCardiologyHeartFailureRequest) => cardiologyHeartFailureService.createAssessment(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cardiology-heart-failure'] });
            navigate('/cardiology/heart-failure');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (payload: CreateCardiologyHeartFailureRequest) => cardiologyHeartFailureService.updateAssessment(id!, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cardiology-heart-failure'] });
            queryClient.invalidateQueries({ queryKey: ['cardiology-heart-failure', id] });
            navigate('/cardiology/heart-failure');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const toNumber = (value: string) => {
        const trimmed = value.trim();
        if (!trimmed) return undefined;
        const num = Number(trimmed);
        return Number.isNaN(num) ? undefined : num;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.patientId) {
            setError('Please select a patient.');
            return;
        }

        const payload: CreateCardiologyHeartFailureRequest = {
            patientId: formData.patientId,
            providerId: formData.providerId || undefined,
            visitId: formData.visitId || undefined,
            status: formData.status,
            assessmentDate: formData.assessmentDate,
            etiology: formData.etiology || undefined,
            nyhaClass: formData.nyhaClass ? formData.nyhaClass as NYHAClass : undefined,
            heartFailureStage: formData.heartFailureStage ? formData.heartFailureStage as HeartFailureStage : undefined,
            lvef: toNumber(formData.lvef),
            symptoms: formData.symptoms || undefined,
            medications: formData.medications || undefined,
            mechanicalSupport: formData.mechanicalSupport || undefined,
            transplantStatus: formData.transplantStatus || undefined,
            implantableDevices: formData.implantableDevices || undefined,
            rehospitalizations: toNumber(formData.rehospitalizations),
            lastHospitalization: formData.lastHospitalization || undefined,
            bnp: toNumber(formData.bnp),
            ntProBnp: toNumber(formData.ntProBnp),
            assessment: formData.assessment || undefined,
            plan: formData.plan || undefined,
            nextFollowUpDate: formData.nextFollowUpDate || undefined,
            notes: formData.notes || undefined,
        };

        if (isEditMode) {
            updateMutation.mutate(payload);
        } else {
            createMutation.mutate(payload);
        }
    };

    const patientOptions: SelectOption[] = (patientsData?.patients || []).map((patient) => ({
        id: patient.id,
        label: `${patient.firstName} ${patient.lastName}`,
        subLabel: patient.mrn,
    }));

    const providerOptions: SelectOption[] = (providersData?.providers || []).map((provider) => ({
        id: provider.id,
        label: `${provider.role === 'DOCTOR' ? 'Dr. ' : ''}${provider.firstName} ${provider.lastName}`,
        subLabel: provider.role,
    }));

    const visitOptions: SelectOption[] = (visitsData?.visits || []).map((visit) => ({
        id: visit.id,
        label: `${visit.patient ? `${visit.patient.firstName} ${visit.patient.lastName}` : visit.patientId} · ${formatDateTime(visit.visitDate)}`,
        subLabel: visit.reason || visit.status,
    }));

    if (isEditMode && isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isEditMode ? 'Edit Heart Failure Assessment' : 'New Heart Failure Assessment'}
                    </h1>
                    <p className="text-gray-500 mt-1">Track heart failure stages, symptoms, and management.</p>
                </div>
                <Link to="/cardiology/heart-failure">
                    <Button variant="outline">
                        <ArrowLeft size={18} className="mr-2" />
                        Back to Assessments
                    </Button>
                </Link>
            </div>

            <CardiologyNav />

            <Card>
                <CardHeader>
                    <CardTitle>Heart Failure Assessment Details</CardTitle>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-100">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <SearchableSelect
                                label="Patient"
                                placeholder="Search patients..."
                                value={patientInput}
                                required
                                options={patientOptions}
                                selectedId={formData.patientId}
                                isLoading={isPatientsLoading}
                                onInputChange={(value) => setPatientInput(value)}
                                onSelect={(option) => {
                                    setFormData((prev) => ({ ...prev, patientId: option.id }));
                                    setPatientInput(option.label);
                                }}
                            />
                            <SearchableSelect
                                label="Ordering Provider"
                                placeholder="Search providers..."
                                value={providerInput}
                                options={providerOptions}
                                selectedId={formData.providerId}
                                isLoading={isProvidersLoading}
                                onInputChange={(value) => setProviderInput(value)}
                                onSelect={(option) => {
                                    setFormData((prev) => ({ ...prev, providerId: option.id }));
                                    setProviderInput(option.label);
                                }}
                            />
                            <SearchableSelect
                                label="Linked Visit"
                                placeholder="Search cardiology visits..."
                                value={visitInput}
                                options={visitOptions}
                                selectedId={formData.visitId}
                                isLoading={isVisitsLoading}
                                onInputChange={(value) => setVisitInput(value)}
                                onSelect={(option) => {
                                    setFormData((prev) => ({ ...prev, visitId: option.id }));
                                    setVisitInput(option.label);
                                }}
                            />
                            <Input
                                label="Assessment Date"
                                type="datetime-local"
                                value={formData.assessmentDate}
                                onChange={(e) => setFormData((prev) => ({ ...prev, assessmentDate: e.target.value }))}
                                required
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                                    value={formData.status}
                                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as CardiologyTestStatus }))}
                                >
                                    {statusOptions.map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                            <Input
                                label="Etiology"
                                value={formData.etiology}
                                onChange={(e) => setFormData((prev) => ({ ...prev, etiology: e.target.value }))}
                                placeholder="Underlying cause of heart failure"
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">NYHA Class</label>
                                <select
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                                    value={formData.nyhaClass}
                                    onChange={(e) => setFormData(prev => ({ ...prev, nyhaClass: e.target.value }))}
                                >
                                    <option value="">Select NYHA Class</option>
                                    {nyhaClassOptions.map((option) => (
                                        <option key={option} value={option}>{option.split('_').join(' ')}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Heart Failure Stage</label>
                                <select
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                                    value={formData.heartFailureStage}
                                    onChange={(e) => setFormData(prev => ({ ...prev, heartFailureStage: e.target.value }))}
                                >
                                    <option value="">Select Stage</option>
                                    {heartFailureStageOptions.map((option) => (
                                        <option key={option} value={option}>{option.split('_').join(' ')}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Input
                                label="LVEF (%)"
                                value={formData.lvef}
                                onChange={(e) => setFormData((prev) => ({ ...prev, lvef: e.target.value }))}
                                placeholder="Left ventricular ejection fraction"
                            />
                            <Input
                                label="Symptoms"
                                value={formData.symptoms}
                                onChange={(e) => setFormData((prev) => ({ ...prev, symptoms: e.target.value }))}
                                placeholder="Patient symptoms"
                            />
                            <Input
                                label="Medications"
                                value={formData.medications}
                                onChange={(e) => setFormData((prev) => ({ ...prev, medications: e.target.value }))}
                                placeholder="Current medications"
                            />
                            <Input
                                label="Mechanical Support"
                                value={formData.mechanicalSupport}
                                onChange={(e) => setFormData((prev) => ({ ...prev, mechanicalSupport: e.target.value }))}
                                placeholder="e.g., VAD, IABP"
                            />
                            <Input
                                label="Transplant Status"
                                value={formData.transplantStatus}
                                onChange={(e) => setFormData((prev) => ({ ...prev, transplantStatus: e.target.value }))}
                                placeholder="e.g., Listed, Not listed"
                            />
                            <Input
                                label="Implantable Devices"
                                value={formData.implantableDevices}
                                onChange={(e) => setFormData((prev) => ({ ...prev, implantableDevices: e.target.value }))}
                                placeholder="Pacemaker, ICD, CRT"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Input
                                label="Rehospitalizations (count)"
                                value={formData.rehospitalizations}
                                onChange={(e) => setFormData((prev) => ({ ...prev, rehospitalizations: e.target.value }))}
                            />
                            <Input
                                label="Last Hospitalization"
                                type="datetime-local"
                                value={formData.lastHospitalization}
                                onChange={(e) => setFormData((prev) => ({ ...prev, lastHospitalization: e.target.value }))}
                            />
                            <Input
                                label="BNP (pg/mL)"
                                value={formData.bnp}
                                onChange={(e) => setFormData((prev) => ({ ...prev, bnp: e.target.value }))}
                            />
                            <Input
                                label="NT-proBNP (pg/mL)"
                                value={formData.ntProBnp}
                                onChange={(e) => setFormData((prev) => ({ ...prev, ntProBnp: e.target.value }))}
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Input
                                label="Assessment"
                                value={formData.assessment}
                                onChange={(e) => setFormData((prev) => ({ ...prev, assessment: e.target.value }))}
                                placeholder="Clinical assessment summary"
                            />
                            <Input
                                label="Plan"
                                value={formData.plan}
                                onChange={(e) => setFormData((prev) => ({ ...prev, plan: e.target.value }))}
                                placeholder="Management plan"
                            />
                            <Input
                                label="Next Follow-up Date"
                                type="datetime-local"
                                value={formData.nextFollowUpDate}
                                onChange={(e) => setFormData((prev) => ({ ...prev, nextFollowUpDate: e.target.value }))}
                            />
                            <Input
                                label="Notes"
                                value={formData.notes}
                                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                                placeholder="Additional notes"
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                <Save size={18} className="mr-2" />
                                {isEditMode ? 'Update Assessment' : 'Create Assessment'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
