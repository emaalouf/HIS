import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { neurologyEmgService } from '../../services/neurology-emg.service';
import { neurologyService } from '../../services/neurology.service';
import { providerService } from '../../services/provider.service';
import { patientService } from '../../services/patient.service';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, SearchableSelect } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import type { NeurologyTestStatus, CreateNeurologyEmgRequest } from '../../types';
import type { SelectOption } from '../../components/ui/SearchableSelect';
import { formatDateTime } from '../../lib/utils';
import { NeurologyNav } from './NeurologyNav';

const statusOptions: NeurologyTestStatus[] = [
    'ORDERED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
];

const formatDateTimeLocal = (value: Date) => {
    const local = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
};

type EmgFormState = {
    patientId: string;
    providerId: string;
    visitId: string;
    performedAt: string;
    status: NeurologyTestStatus;
    indication: string;
    musclesTested: string;
    findings: string;
    interpretation: string;
    neuropathyPresent: boolean;
    myopathyPresent: boolean;
    conductionVelocity: string;
    amplitude: string;
    distalLatency: string;
    fWaveLatency: string;
    notes: string;
};

export function NeurologyEmgFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const isEditMode = Boolean(id);
    const [patientInput, setPatientInput] = useState('');
    const [providerInput, setProviderInput] = useState('');
    const [visitInput, setVisitInput] = useState('');

    const defaultPerformedAt = useMemo(() => formatDateTimeLocal(new Date()), []);

    const [formData, setFormData] = useState<EmgFormState>({
        patientId: '',
        providerId: '',
        visitId: '',
        performedAt: defaultPerformedAt,
        status: 'ORDERED',
        indication: '',
        musclesTested: '',
        findings: '',
        interpretation: '',
        neuropathyPresent: false,
        myopathyPresent: false,
        conductionVelocity: '',
        amplitude: '',
        distalLatency: '',
        fWaveLatency: '',
        notes: '',
    });

    const { data: emg, isLoading } = useQuery({
        queryKey: ['neurology-emg', id],
        queryFn: () => neurologyEmgService.getEmg(id!),
        enabled: isEditMode,
    });

    const patientSearch = patientInput.trim();
    const providerSearch = providerInput.trim();
    const visitSearch = visitInput.trim();

    const { data: patientsData, isLoading: isPatientsLoading } = useQuery({
        queryKey: ['patients', 'neurology-emg-picker', patientSearch],
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
        queryKey: ['providers', 'neurology-emg-picker', providerSearch],
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
        queryKey: ['neurology-visits', 'emg-picker', visitSearch],
        queryFn: () =>
            neurologyService.getVisits({
                page: 1,
                limit: 10,
                search: visitSearch || undefined,
            }),
    });

    useEffect(() => {
        if (!emg) return;
        setFormData({
            patientId: emg.patientId,
            providerId: emg.providerId || '',
            visitId: emg.visitId || '',
            performedAt: formatDateTimeLocal(new Date(emg.performedAt)),
            status: emg.status,
            indication: emg.indication || '',
            musclesTested: emg.musclesTested || '',
            findings: emg.findings || '',
            interpretation: emg.interpretation || '',
            neuropathyPresent: emg.neuropathyPresent || false,
            myopathyPresent: emg.myopathyPresent || false,
            conductionVelocity: emg.conductionVelocity?.toString() || '',
            amplitude: emg.amplitude?.toString() || '',
            distalLatency: emg.distalLatency?.toString() || '',
            fWaveLatency: emg.fWaveLatency?.toString() || '',
            notes: emg.notes || '',
        });
        if (emg.patient) {
            setPatientInput(`${emg.patient.firstName} ${emg.patient.lastName}`);
        } else {
            setPatientInput(emg.patientId);
        }
        if (emg.provider) {
            const prefix = emg.provider.role === 'DOCTOR' ? 'Dr. ' : '';
            setProviderInput(`${prefix}${emg.provider.firstName} ${emg.provider.lastName}`);
        } else if (emg.providerId) {
            setProviderInput(emg.providerId);
        }
        if (emg.visit) {
            setVisitInput(`${formatDateTime(emg.visit.visitDate)} · ${emg.visit.id}`);
        } else if (emg.visitId) {
            setVisitInput(emg.visitId);
        }
    }, [emg]);

    const createMutation = useMutation({
        mutationFn: (payload: CreateNeurologyEmgRequest) => neurologyEmgService.createEmg(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['neurology-emgs'] });
            navigate('/neurology/emgs');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (payload: CreateNeurologyEmgRequest) => neurologyEmgService.updateEmg(id!, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['neurology-emgs'] });
            queryClient.invalidateQueries({ queryKey: ['neurology-emg', id] });
            navigate('/neurology/emgs');
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

        const payload: CreateNeurologyEmgRequest = {
            patientId: formData.patientId,
            providerId: formData.providerId || undefined,
            visitId: formData.visitId || undefined,
            status: formData.status,
            performedAt: formData.performedAt,
            indication: formData.indication || undefined,
            musclesTested: formData.musclesTested || undefined,
            findings: formData.findings || undefined,
            interpretation: formData.interpretation || undefined,
            neuropathyPresent: formData.neuropathyPresent,
            myopathyPresent: formData.myopathyPresent,
            conductionVelocity: toNumber(formData.conductionVelocity),
            amplitude: toNumber(formData.amplitude),
            distalLatency: toNumber(formData.distalLatency),
            fWaveLatency: toNumber(formData.fWaveLatency),
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isEditMode ? 'Edit EMG' : 'New EMG'}
                    </h1>
                    <p className="text-gray-500 mt-1">Capture EMG recording details and interpretation.</p>
                </div>
                <Link to="/neurology/emgs">
                    <Button variant="outline">
                        <ArrowLeft size={18} className="mr-2" />
                        Back to EMGs
                    </Button>
                </Link>
            </div>

            <NeurologyNav />

            <Card>
                <CardHeader>
                    <CardTitle>EMG Details</CardTitle>
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
                                placeholder="Search neurology visits..."
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
                                label="Performed At"
                                type="datetime-local"
                                value={formData.performedAt}
                                onChange={(e) => setFormData((prev) => ({ ...prev, performedAt: e.target.value }))}
                                required
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                                    value={formData.status}
                                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as NeurologyTestStatus }))}
                                >
                                    {statusOptions.map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                            <Input
                                label="Indication"
                                value={formData.indication}
                                onChange={(e) => setFormData((prev) => ({ ...prev, indication: e.target.value }))}
                                placeholder="Reason for EMG"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <Input
                                label="Muscles Tested"
                                value={formData.musclesTested}
                                onChange={(e) => setFormData((prev) => ({ ...prev, musclesTested: e.target.value }))}
                                placeholder="e.g., Right median nerve, Left ulnar nerve"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.neuropathyPresent}
                                        onChange={(e) => setFormData(prev => ({ ...prev, neuropathyPresent: e.target.checked }))}
                                        className="rounded border-gray-300"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Neuropathy Present</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.myopathyPresent}
                                        onChange={(e) => setFormData(prev => ({ ...prev, myopathyPresent: e.target.checked }))}
                                        className="rounded border-gray-300"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Myopathy Present</span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            <Input
                                label="Conduction Velocity (m/s)"
                                value={formData.conductionVelocity}
                                onChange={(e) => setFormData((prev) => ({ ...prev, conductionVelocity: e.target.value }))}
                                placeholder="e.g., 50"
                            />
                            <Input
                                label="Amplitude (mV)"
                                value={formData.amplitude}
                                onChange={(e) => setFormData((prev) => ({ ...prev, amplitude: e.target.value }))}
                                placeholder="e.g., 5.2"
                            />
                            <Input
                                label="Distal Latency (ms)"
                                value={formData.distalLatency}
                                onChange={(e) => setFormData((prev) => ({ ...prev, distalLatency: e.target.value }))}
                                placeholder="e.g., 3.5"
                            />
                            <Input
                                label="F-Wave Latency (ms)"
                                value={formData.fWaveLatency}
                                onChange={(e) => setFormData((prev) => ({ ...prev, fWaveLatency: e.target.value }))}
                                placeholder="e.g., 28.0"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <Input
                                label="Findings"
                                value={formData.findings}
                                onChange={(e) => setFormData((prev) => ({ ...prev, findings: e.target.value }))}
                                placeholder="Detailed EMG findings"
                            />
                            <Input
                                label="Interpretation"
                                value={formData.interpretation}
                                onChange={(e) => setFormData((prev) => ({ ...prev, interpretation: e.target.value }))}
                                placeholder="Clinical interpretation"
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
                                {isEditMode ? 'Update EMG' : 'Create EMG'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
