import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { neurologyService } from '../../services/neurology.service';
import { providerService } from '../../services/provider.service';
import { patientService } from '../../services/patient.service';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, SearchableSelect } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import type { CreateNeurologyVisitRequest, NeurologyVisitStatus } from '../../types';
import type { SelectOption } from '../../components/ui/SearchableSelect';
import { NeurologyNav } from './NeurologyNav';

const statusOptions: NeurologyVisitStatus[] = [
    'SCHEDULED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
];

const formatDateTimeLocal = (value: Date) => {
    const local = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
};

type NeurologyFormState = {
    patientId: string;
    providerId: string;
    visitDate: string;
    status: NeurologyVisitStatus;
    reason: string;
    symptoms: string;
    mentalStatus: string;
    cranialNerves: string;
    motorExam: string;
    sensoryExam: string;
    reflexes: string;
    coordination: string;
    gait: string;
    speech: string;
    nihssScore: string;
    gcsScore: string;
    diagnosis: string;
    assessment: string;
    plan: string;
    notes: string;
};

export function NeurologyFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const isEditMode = Boolean(id);
    const [patientInput, setPatientInput] = useState('');
    const [providerInput, setProviderInput] = useState('');

    const defaultVisitDate = useMemo(() => formatDateTimeLocal(new Date()), []);

    const [formData, setFormData] = useState<NeurologyFormState>({
        patientId: '',
        providerId: '',
        visitDate: defaultVisitDate,
        status: 'SCHEDULED',
        reason: '',
        symptoms: '',
        mentalStatus: '',
        cranialNerves: '',
        motorExam: '',
        sensoryExam: '',
        reflexes: '',
        coordination: '',
        gait: '',
        speech: '',
        nihssScore: '',
        gcsScore: '',
        diagnosis: '',
        assessment: '',
        plan: '',
        notes: '',
    });

    const { data: visit, isLoading } = useQuery({
        queryKey: ['neurology-visit', id],
        queryFn: () => neurologyService.getVisit(id!),
        enabled: isEditMode,
    });

    const patientSearch = patientInput.trim();
    const providerSearch = providerInput.trim();

    const { data: patientsData, isLoading: isPatientsLoading } = useQuery({
        queryKey: ['patients', 'neurology-picker', patientSearch],
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
        queryKey: ['providers', 'neurology-picker', providerSearch],
        queryFn: () =>
            providerService.getProviders({
                page: 1,
                limit: 10,
                search: providerSearch || undefined,
                sortBy: providerSearch ? undefined : 'createdAt',
                sortOrder: providerSearch ? undefined : 'desc',
            }),
    });

    useEffect(() => {
        if (!visit) return;
        setFormData({
            patientId: visit.patientId,
            providerId: visit.providerId,
            visitDate: formatDateTimeLocal(new Date(visit.visitDate)),
            status: visit.status,
            reason: visit.reason || '',
            symptoms: visit.symptoms || '',
            mentalStatus: visit.mentalStatus || '',
            cranialNerves: visit.cranialNerves || '',
            motorExam: visit.motorExam || '',
            sensoryExam: visit.sensoryExam || '',
            reflexes: visit.reflexes || '',
            coordination: visit.coordination || '',
            gait: visit.gait || '',
            speech: visit.speech || '',
            nihssScore: visit.nihssScore?.toString() || '',
            gcsScore: visit.gcsScore?.toString() || '',
            diagnosis: visit.diagnosis || '',
            assessment: visit.assessment || '',
            plan: visit.plan || '',
            notes: visit.notes || '',
        });
        if (visit.patient) {
            setPatientInput(`${visit.patient.firstName} ${visit.patient.lastName}`);
        } else {
            setPatientInput(visit.patientId);
        }
        if (visit.provider) {
            const prefix = visit.provider.role === 'DOCTOR' ? 'Dr. ' : '';
            setProviderInput(`${prefix}${visit.provider.firstName} ${visit.provider.lastName}`);
        } else {
            setProviderInput(visit.providerId);
        }
    }, [visit]);

    const createMutation = useMutation({
        mutationFn: (payload: CreateNeurologyVisitRequest) => neurologyService.createVisit(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['neurology-visits'] });
            navigate('/neurology');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (payload: CreateNeurologyVisitRequest) => neurologyService.updateVisit(id!, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['neurology-visits'] });
            queryClient.invalidateQueries({ queryKey: ['neurology-visit', id] });
            navigate('/neurology');
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
        if (!formData.providerId) {
            setError('Please select a provider.');
            return;
        }

        const payload: CreateNeurologyVisitRequest = {
            patientId: formData.patientId,
            providerId: formData.providerId,
            status: formData.status,
            visitDate: formData.visitDate,
            reason: formData.reason || undefined,
            symptoms: formData.symptoms || undefined,
            mentalStatus: formData.mentalStatus || undefined,
            cranialNerves: formData.cranialNerves || undefined,
            motorExam: formData.motorExam || undefined,
            sensoryExam: formData.sensoryExam || undefined,
            reflexes: formData.reflexes || undefined,
            coordination: formData.coordination || undefined,
            gait: formData.gait || undefined,
            speech: formData.speech || undefined,
            nihssScore: toNumber(formData.nihssScore),
            gcsScore: toNumber(formData.gcsScore),
            diagnosis: formData.diagnosis || undefined,
            assessment: formData.assessment || undefined,
            plan: formData.plan || undefined,
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

    if (isEditMode && isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
            </div>
        );
    }

    if (isEditMode && !visit && !isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link to="/neurology">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft size={18} className="mr-2" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Neurology Visit</h1>
                        <p className="text-gray-500 mt-1">Visit not found.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/neurology">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft size={18} className="mr-2" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {isEditMode ? 'Edit Neurology Visit' : 'New Neurology Visit'}
                        </h1>
                        <p className="text-gray-500 mt-1">Capture neurologic exam details and plan.</p>
                    </div>
                </div>
            </div>

            <NeurologyNav />

            <Card>
                <CardHeader>
                    <CardTitle>Visit Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <SearchableSelect
                                label="Patient"
                                placeholder="Search patients..."
                                value={patientInput}
                                options={patientOptions}
                                selectedId={formData.patientId}
                                isLoading={isPatientsLoading}
                                required
                                onInputChange={setPatientInput}
                                onSelect={(option) => {
                                    setFormData((prev) => ({ ...prev, patientId: option.id }));
                                    setPatientInput(option.label);
                                }}
                            />
                            <SearchableSelect
                                label="Provider"
                                placeholder="Search providers..."
                                value={providerInput}
                                options={providerOptions}
                                selectedId={formData.providerId}
                                isLoading={isProvidersLoading}
                                required
                                onInputChange={setProviderInput}
                                onSelect={(option) => {
                                    setFormData((prev) => ({ ...prev, providerId: option.id }));
                                    setProviderInput(option.label);
                                }}
                            />
                            <Input
                                label="Visit Date"
                                type="datetime-local"
                                value={formData.visitDate}
                                onChange={(e) => setFormData((prev) => ({ ...prev, visitDate: e.target.value }))}
                                required
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                                    value={formData.status}
                                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as NeurologyVisitStatus }))}
                                >
                                    {statusOptions.map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <Input
                                label="Reason for Visit"
                                value={formData.reason}
                                onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
                                placeholder="e.g. Headache, weakness"
                            />
                            <Input
                                label="Symptoms"
                                value={formData.symptoms}
                                onChange={(e) => setFormData((prev) => ({ ...prev, symptoms: e.target.value }))}
                                placeholder="e.g. Photophobia, dizziness"
                            />
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Neurologic Exam</h3>
                            <div className="grid grid-cols-1 gap-6">
                                <Input
                                    label="Mental Status"
                                    value={formData.mentalStatus}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, mentalStatus: e.target.value }))}
                                    placeholder="Alert, oriented, memory intact"
                                />
                                <Input
                                    label="Cranial Nerves"
                                    value={formData.cranialNerves}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, cranialNerves: e.target.value }))}
                                    placeholder="CN II-XII intact"
                                />
                                <Input
                                    label="Motor Exam"
                                    value={formData.motorExam}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, motorExam: e.target.value }))}
                                    placeholder="Strength, tone, bulk"
                                />
                                <Input
                                    label="Sensory Exam"
                                    value={formData.sensoryExam}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, sensoryExam: e.target.value }))}
                                    placeholder="Light touch, pinprick, proprioception"
                                />
                                <Input
                                    label="Reflexes"
                                    value={formData.reflexes}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, reflexes: e.target.value }))}
                                    placeholder="2+ symmetric, plantar responses"
                                />
                                <Input
                                    label="Coordination"
                                    value={formData.coordination}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, coordination: e.target.value }))}
                                    placeholder="Finger-to-nose, heel-to-shin"
                                />
                                <Input
                                    label="Gait"
                                    value={formData.gait}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, gait: e.target.value }))}
                                    placeholder="Normal, ataxic, assisted"
                                />
                                <Input
                                    label="Speech"
                                    value={formData.speech}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, speech: e.target.value }))}
                                    placeholder="Fluent, dysarthric"
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="NIHSS Score"
                                        type="number"
                                        value={formData.nihssScore}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, nihssScore: e.target.value }))}
                                        placeholder="0-42"
                                    />
                                    <Input
                                        label="GCS Score"
                                        type="number"
                                        value={formData.gcsScore}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, gcsScore: e.target.value }))}
                                        placeholder="3-15"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment and Plan</h3>
                            <div className="grid grid-cols-1 gap-6">
                                <Input
                                    label="Diagnosis"
                                    value={formData.diagnosis}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, diagnosis: e.target.value }))}
                                    placeholder="e.g. Migraine, TIA"
                                />
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
                                    placeholder="Care plan and follow-up"
                                />
                                <Input
                                    label="Notes"
                                    value={formData.notes}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Additional notes"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                <Save size={18} className="mr-2" />
                                {isEditMode ? 'Update Visit' : 'Create Visit'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
