import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { encounterService } from '../../services/encounter.service';
import { providerService } from '../../services/provider.service';
import { patientService } from '../../services/patient.service';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, SearchableSelect } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import type { CreateEncounterRequest, EncounterStatus } from '../../types';
import type { SelectOption } from '../../components/ui/SearchableSelect';
import { ClinicalNav } from './ClinicalNav';

const statusOptions: EncounterStatus[] = [
    'OPEN',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
];

const formatDateTimeLocal = (value: Date) => {
    const local = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
};

type EncounterFormState = {
    patientId: string;
    providerId: string;
    appointmentId: string;
    admissionId: string;
    status: EncounterStatus;
    reasonForVisit: string;
    diagnosis: string;
    assessment: string;
    plan: string;
    startTime: string;
    endTime: string;
    notes: string;
};

export function EncounterFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const isEditMode = Boolean(id);
    const [patientInput, setPatientInput] = useState('');
    const [providerInput, setProviderInput] = useState('');

    const defaultStartTime = useMemo(() => formatDateTimeLocal(new Date()), []);

    const [formData, setFormData] = useState<EncounterFormState>({
        patientId: '',
        providerId: '',
        appointmentId: '',
        admissionId: '',
        status: 'OPEN',
        reasonForVisit: '',
        diagnosis: '',
        assessment: '',
        plan: '',
        startTime: defaultStartTime,
        endTime: '',
        notes: '',
    });

    const { data: encounter, isLoading } = useQuery({
        queryKey: ['encounter', id],
        queryFn: () => encounterService.getEncounter(id!),
        enabled: isEditMode,
    });

    const patientSearch = patientInput.trim();
    const providerSearch = providerInput.trim();

    const { data: patientsData, isLoading: isPatientsLoading } = useQuery({
        queryKey: ['patients', 'encounter-picker', patientSearch],
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
        queryKey: ['providers', 'encounter-picker', providerSearch],
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
        if (!encounter) return;
        setFormData({
            patientId: encounter.patientId,
            providerId: encounter.providerId,
            appointmentId: encounter.appointmentId || '',
            admissionId: encounter.admissionId || '',
            status: encounter.status,
            reasonForVisit: encounter.reasonForVisit || '',
            diagnosis: encounter.diagnosis || '',
            assessment: encounter.assessment || '',
            plan: encounter.plan || '',
            startTime: formatDateTimeLocal(new Date(encounter.startTime)),
            endTime: encounter.endTime ? formatDateTimeLocal(new Date(encounter.endTime)) : '',
            notes: encounter.notes || '',
        });
        if (encounter.patient) {
            setPatientInput(`${encounter.patient.firstName} ${encounter.patient.lastName}`);
        } else {
            setPatientInput(encounter.patientId);
        }
        if (encounter.provider) {
            const prefix = encounter.provider.role === 'DOCTOR' ? 'Dr. ' : '';
            setProviderInput(`${prefix}${encounter.provider.firstName} ${encounter.provider.lastName}`);
        } else {
            setProviderInput(encounter.providerId);
        }
    }, [encounter]);

    const createMutation = useMutation({
        mutationFn: (payload: CreateEncounterRequest) => encounterService.createEncounter(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['encounters'] });
            navigate('/encounters');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (payload: CreateEncounterRequest) => encounterService.updateEncounter(id!, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['encounters'] });
            queryClient.invalidateQueries({ queryKey: ['encounter', id] });
            navigate('/encounters');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

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

        const payload: CreateEncounterRequest = {
            patientId: formData.patientId,
            providerId: formData.providerId,
            appointmentId: formData.appointmentId || undefined,
            admissionId: formData.admissionId || undefined,
            status: formData.status,
            reasonForVisit: formData.reasonForVisit || undefined,
            diagnosis: formData.diagnosis || undefined,
            assessment: formData.assessment || undefined,
            plan: formData.plan || undefined,
            startTime: formData.startTime || undefined,
            endTime: formData.endTime || undefined,
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (isEditMode && !encounter && !isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link to="/encounters">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft size={18} className="mr-2" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Encounter</h1>
                        <p className="text-gray-500 mt-1">Encounter not found.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/encounters">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft size={18} className="mr-2" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {isEditMode ? 'Edit Encounter' : 'New Encounter'}
                        </h1>
                        <p className="text-gray-500 mt-1">Document the visit context and plan.</p>
                    </div>
                </div>
            </div>

            <ClinicalNav />

            <Card>
                <CardHeader>
                    <CardTitle>Encounter Details</CardTitle>
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
                                label="Appointment ID"
                                value={formData.appointmentId}
                                onChange={(e) => setFormData((prev) => ({ ...prev, appointmentId: e.target.value }))}
                                placeholder="Optional appointment reference"
                            />
                            <Input
                                label="Admission ID"
                                value={formData.admissionId}
                                onChange={(e) => setFormData((prev) => ({ ...prev, admissionId: e.target.value }))}
                                placeholder="Optional admission reference"
                            />
                            <Input
                                label="Start Time"
                                type="datetime-local"
                                value={formData.startTime}
                                onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
                                required
                            />
                            <Input
                                label="End Time"
                                type="datetime-local"
                                value={formData.endTime}
                                onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                                    value={formData.status}
                                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as EncounterStatus }))}
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
                                value={formData.reasonForVisit}
                                onChange={(e) => setFormData((prev) => ({ ...prev, reasonForVisit: e.target.value }))}
                                placeholder="e.g. Chest pain, headache"
                            />
                            <Input
                                label="Diagnosis"
                                value={formData.diagnosis}
                                onChange={(e) => setFormData((prev) => ({ ...prev, diagnosis: e.target.value }))}
                                placeholder="Primary diagnosis"
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

                        <div className="flex justify-end">
                            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                <Save size={18} className="mr-2" />
                                {isEditMode ? 'Update Encounter' : 'Create Encounter'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
