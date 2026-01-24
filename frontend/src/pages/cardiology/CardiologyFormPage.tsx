import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cardiologyService } from '../../services/cardiology.service';
import { providerService } from '../../services/provider.service';
import { patientService } from '../../services/patient.service';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, SearchableSelect } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import type { CardiologyVisitStatus, CreateCardiologyVisitRequest } from '../../types';
import type { SelectOption } from '../../components/ui/SearchableSelect';
import { CardiologyNav } from './CardiologyNav';

const statusOptions: CardiologyVisitStatus[] = [
    'SCHEDULED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
];

const formatDateTimeLocal = (value: Date) => {
    const local = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
};

type CardiologyFormState = {
    patientId: string;
    providerId: string;
    visitDate: string;
    status: CardiologyVisitStatus;
    reason: string;
    symptoms: string;
    diagnosis: string;
    assessment: string;
    plan: string;
    notes: string;
};

export function CardiologyFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const isEditMode = Boolean(id);
    const [patientInput, setPatientInput] = useState('');
    const [providerInput, setProviderInput] = useState('');

    const defaultVisitDate = useMemo(() => formatDateTimeLocal(new Date()), []);

    const [formData, setFormData] = useState<CardiologyFormState>({
        patientId: '',
        providerId: '',
        visitDate: defaultVisitDate,
        status: 'SCHEDULED',
        reason: '',
        symptoms: '',
        diagnosis: '',
        assessment: '',
        plan: '',
        notes: '',
    });

    const { data: visit, isLoading } = useQuery({
        queryKey: ['cardiology-visit', id],
        queryFn: () => cardiologyService.getVisit(id!),
        enabled: isEditMode,
    });

    const patientSearch = patientInput.trim();
    const providerSearch = providerInput.trim();

    const { data: patientsData, isLoading: isPatientsLoading } = useQuery({
        queryKey: ['patients', 'cardiology-picker', patientSearch],
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
        queryKey: ['providers', 'cardiology-picker', providerSearch],
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
        mutationFn: (payload: CreateCardiologyVisitRequest) => cardiologyService.createVisit(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cardiology-visits'] });
            navigate('/cardiology');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (payload: CreateCardiologyVisitRequest) => cardiologyService.updateVisit(id!, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cardiology-visits'] });
            queryClient.invalidateQueries({ queryKey: ['cardiology-visit', id] });
            navigate('/cardiology');
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

        const payload: CreateCardiologyVisitRequest = {
            patientId: formData.patientId,
            providerId: formData.providerId,
            status: formData.status,
            visitDate: formData.visitDate,
            reason: formData.reason || undefined,
            symptoms: formData.symptoms || undefined,
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
            </div>
        );
    }

    if (isEditMode && !visit && !isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Edit Cardiology Visit</h1>
                        <p className="text-gray-500 mt-1">Visit not found.</p>
                    </div>
                    <Link to="/cardiology">
                        <Button variant="outline">
                            <ArrowLeft size={18} className="mr-2" />
                            Back to Visits
                        </Button>
                    </Link>
                </div>
                <CardiologyNav />
                <Card className="p-8 text-center text-gray-500">
                    Cardiology visit not found
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isEditMode ? 'Edit Cardiology Visit' : 'New Cardiology Visit'}
                    </h1>
                    <p className="text-gray-500 mt-1">Document consults, assessment, and follow-up plans.</p>
                </div>
                <Link to="/cardiology">
                    <Button variant="outline">
                        <ArrowLeft size={18} className="mr-2" />
                        Back to Visits
                    </Button>
                </Link>
            </div>

            <CardiologyNav />

            <Card>
                <CardHeader>
                    <CardTitle>Visit Details</CardTitle>
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
                                label="Provider"
                                placeholder="Search providers..."
                                value={providerInput}
                                required
                                options={providerOptions}
                                selectedId={formData.providerId}
                                isLoading={isProvidersLoading}
                                onInputChange={(value) => setProviderInput(value)}
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
                                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as CardiologyVisitStatus }))}
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
                                placeholder="e.g. Chest pain, palpitations"
                            />
                            <Input
                                label="Symptoms"
                                value={formData.symptoms}
                                onChange={(e) => setFormData((prev) => ({ ...prev, symptoms: e.target.value }))}
                                placeholder="e.g. Shortness of breath, dizziness"
                            />
                            <Input
                                label="Diagnosis"
                                value={formData.diagnosis}
                                onChange={(e) => setFormData((prev) => ({ ...prev, diagnosis: e.target.value }))}
                                placeholder="e.g. Stable angina, AFib"
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
                                {isEditMode ? 'Update Visit' : 'Create Visit'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
