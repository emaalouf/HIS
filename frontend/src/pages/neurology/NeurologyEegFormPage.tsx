import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { neurologyEegService } from '../../services/neurology-eeg.service';
import { neurologyService } from '../../services/neurology.service';
import { providerService } from '../../services/provider.service';
import { patientService } from '../../services/patient.service';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, SearchableSelect } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import type { NeurologyTestStatus, CreateNeurologyEegRequest } from '../../types';
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

type EegFormState = {
    patientId: string;
    providerId: string;
    visitId: string;
    recordedAt: string;
    status: NeurologyTestStatus;
    durationMinutes: string;
    indication: string;
    findings: string;
    interpretation: string;
    seizuresDetected: boolean;
    seizureCount: string;
    backgroundActivity: string;
    sleepArchitecture: string;
    photicStimulation: boolean;
    hyperventilation: boolean;
    notes: string;
};

export function NeurologyEegFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const isEditMode = Boolean(id);
    const [patientInput, setPatientInput] = useState('');
    const [providerInput, setProviderInput] = useState('');
    const [visitInput, setVisitInput] = useState('');

    const defaultRecordedAt = useMemo(() => formatDateTimeLocal(new Date()), []);

    const [formData, setFormData] = useState<EegFormState>({
        patientId: '',
        providerId: '',
        visitId: '',
        recordedAt: defaultRecordedAt,
        status: 'ORDERED',
        durationMinutes: '',
        indication: '',
        findings: '',
        interpretation: '',
        seizuresDetected: false,
        seizureCount: '',
        backgroundActivity: '',
        sleepArchitecture: '',
        photicStimulation: false,
        hyperventilation: false,
        notes: '',
    });

    const { data: eeg, isLoading } = useQuery({
        queryKey: ['neurology-eeg', id],
        queryFn: () => neurologyEegService.getEeg(id!),
        enabled: isEditMode,
    });

    const patientSearch = patientInput.trim();
    const providerSearch = providerInput.trim();
    const visitSearch = visitInput.trim();

    const { data: patientsData, isLoading: isPatientsLoading } = useQuery({
        queryKey: ['patients', 'neurology-eeg-picker', patientSearch],
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
        queryKey: ['providers', 'neurology-eeg-picker', providerSearch],
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
        queryKey: ['neurology-visits', 'eeg-picker', visitSearch],
        queryFn: () =>
            neurologyService.getVisits({
                page: 1,
                limit: 10,
                search: visitSearch || undefined,
            }),
    });

    useEffect(() => {
        if (!eeg) return;
        setFormData({
            patientId: eeg.patientId,
            providerId: eeg.providerId || '',
            visitId: eeg.visitId || '',
            recordedAt: formatDateTimeLocal(new Date(eeg.recordedAt)),
            status: eeg.status,
            durationMinutes: eeg.durationMinutes?.toString() || '',
            indication: eeg.indication || '',
            findings: eeg.findings || '',
            interpretation: eeg.interpretation || '',
            seizuresDetected: eeg.seizuresDetected || false,
            seizureCount: eeg.seizureCount?.toString() || '',
            backgroundActivity: eeg.backgroundActivity || '',
            sleepArchitecture: eeg.sleepArchitecture || '',
            photicStimulation: eeg.photicStimulation || false,
            hyperventilation: eeg.hyperventilation || false,
            notes: eeg.notes || '',
        });
        if (eeg.patient) {
            setPatientInput(`${eeg.patient.firstName} ${eeg.patient.lastName}`);
        } else {
            setPatientInput(eeg.patientId);
        }
        if (eeg.provider) {
            const prefix = eeg.provider.role === 'DOCTOR' ? 'Dr. ' : '';
            setProviderInput(`${prefix}${eeg.provider.firstName} ${eeg.provider.lastName}`);
        } else if (eeg.providerId) {
            setProviderInput(eeg.providerId);
        }
        if (eeg.visit) {
            setVisitInput(`${formatDateTime(eeg.visit.visitDate)} · ${eeg.visit.id}`);
        } else if (eeg.visitId) {
            setVisitInput(eeg.visitId);
        }
    }, [eeg]);

    const createMutation = useMutation({
        mutationFn: (payload: CreateNeurologyEegRequest) => neurologyEegService.createEeg(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['neurology-eegs'] });
            navigate('/neurology/eegs');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (payload: CreateNeurologyEegRequest) => neurologyEegService.updateEeg(id!, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['neurology-eegs'] });
            queryClient.invalidateQueries({ queryKey: ['neurology-eeg', id] });
            navigate('/neurology/eegs');
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

        const payload: CreateNeurologyEegRequest = {
            patientId: formData.patientId,
            providerId: formData.providerId || undefined,
            visitId: formData.visitId || undefined,
            status: formData.status,
            recordedAt: formData.recordedAt,
            durationMinutes: toNumber(formData.durationMinutes),
            indication: formData.indication || undefined,
            findings: formData.findings || undefined,
            interpretation: formData.interpretation || undefined,
            seizuresDetected: formData.seizuresDetected,
            seizureCount: toNumber(formData.seizureCount),
            backgroundActivity: formData.backgroundActivity || undefined,
            sleepArchitecture: formData.sleepArchitecture || undefined,
            photicStimulation: formData.photicStimulation,
            hyperventilation: formData.hyperventilation,
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
                        {isEditMode ? 'Edit EEG' : 'New EEG'}
                    </h1>
                    <p className="text-gray-500 mt-1">Capture EEG recording details and interpretation.</p>
                </div>
                <Link to="/neurology/eegs">
                    <Button variant="outline">
                        <ArrowLeft size={18} className="mr-2" />
                        Back to EEGs
                    </Button>
                </Link>
            </div>

            <NeurologyNav />

            <Card>
                <CardHeader>
                    <CardTitle>EEG Details</CardTitle>
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
                                label="Recorded At"
                                type="datetime-local"
                                value={formData.recordedAt}
                                onChange={(e) => setFormData((prev) => ({ ...prev, recordedAt: e.target.value }))}
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
                                label="Duration (minutes)"
                                value={formData.durationMinutes}
                                onChange={(e) => setFormData((prev) => ({ ...prev, durationMinutes: e.target.value }))}
                                placeholder="e.g., 30"
                            />
                            <Input
                                label="Indication"
                                value={formData.indication}
                                onChange={(e) => setFormData((prev) => ({ ...prev, indication: e.target.value }))}
                                placeholder="Reason for EEG"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Input
                                label="Background Activity"
                                value={formData.backgroundActivity}
                                onChange={(e) => setFormData((prev) => ({ ...prev, backgroundActivity: e.target.value }))}
                                placeholder="e.g., Normal posterior dominant rhythm"
                            />
                            <Input
                                label="Sleep Architecture"
                                value={formData.sleepArchitecture}
                                onChange={(e) => setFormData((prev) => ({ ...prev, sleepArchitecture: e.target.value }))}
                                placeholder="e.g., Normal sleep spindles and K-complexes"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.seizuresDetected}
                                        onChange={(e) => setFormData(prev => ({ ...prev, seizuresDetected: e.target.checked }))}
                                        className="rounded border-gray-300"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Seizures Detected</span>
                                </label>
                                {formData.seizuresDetected && (
                                    <Input
                                        label=""
                                        value={formData.seizureCount}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, seizureCount: e.target.value }))}
                                        placeholder="Count"
                                        className="w-24"
                                    />
                                )}
                            </div>
                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.photicStimulation}
                                        onChange={(e) => setFormData(prev => ({ ...prev, photicStimulation: e.target.checked }))}
                                        className="rounded border-gray-300"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Photic Stimulation</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.hyperventilation}
                                        onChange={(e) => setFormData(prev => ({ ...prev, hyperventilation: e.target.checked }))}
                                        className="rounded border-gray-300"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Hyperventilation</span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <Input
                                label="Findings"
                                value={formData.findings}
                                onChange={(e) => setFormData((prev) => ({ ...prev, findings: e.target.value }))}
                                placeholder="Detailed EEG findings"
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
                                {isEditMode ? 'Update EEG' : 'Create EEG'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
