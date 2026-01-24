import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cardiologyStressTestService } from '../../services/cardiology-stress-test.service';
import { cardiologyService } from '../../services/cardiology.service';
import { providerService } from '../../services/provider.service';
import { patientService } from '../../services/patient.service';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, SearchableSelect } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import type { CardiologyTestStatus, CreateCardiologyStressTestRequest } from '../../types';
import type { SelectOption } from '../../components/ui/SearchableSelect';
import { formatDateTime } from '../../lib/utils';
import { CardiologyNav } from './CardiologyNav';

const statusOptions: CardiologyTestStatus[] = [
    'ORDERED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
];

const formatDateTimeLocal = (value: Date) => {
    const local = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
};

type StressTestFormState = {
    patientId: string;
    providerId: string;
    visitId: string;
    performedAt: string;
    status: CardiologyTestStatus;
    type: string;
    protocol: string;
    durationMinutes: string;
    mets: string;
    maxHeartRate: string;
    maxBpSystolic: string;
    maxBpDiastolic: string;
    symptoms: string;
    result: string;
    notes: string;
};

export function CardiologyStressTestFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const isEditMode = Boolean(id);
    const [patientInput, setPatientInput] = useState('');
    const [providerInput, setProviderInput] = useState('');
    const [visitInput, setVisitInput] = useState('');

    const defaultPerformedAt = useMemo(() => formatDateTimeLocal(new Date()), []);

    const [formData, setFormData] = useState<StressTestFormState>({
        patientId: '',
        providerId: '',
        visitId: '',
        performedAt: defaultPerformedAt,
        status: 'ORDERED',
        type: '',
        protocol: '',
        durationMinutes: '',
        mets: '',
        maxHeartRate: '',
        maxBpSystolic: '',
        maxBpDiastolic: '',
        symptoms: '',
        result: '',
        notes: '',
    });

    const { data: stressTest, isLoading } = useQuery({
        queryKey: ['cardiology-stress-test', id],
        queryFn: () => cardiologyStressTestService.getStressTest(id!),
        enabled: isEditMode,
    });

    const patientSearch = patientInput.trim();
    const providerSearch = providerInput.trim();
    const visitSearch = visitInput.trim();

    const { data: patientsData, isLoading: isPatientsLoading } = useQuery({
        queryKey: ['patients', 'cardiology-stress-picker', patientSearch],
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
        queryKey: ['providers', 'cardiology-stress-picker', providerSearch],
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
        queryKey: ['cardiology-visits', 'stress-picker', visitSearch],
        queryFn: () =>
            cardiologyService.getVisits({
                page: 1,
                limit: 10,
                search: visitSearch || undefined,
            }),
    });

    useEffect(() => {
        if (!stressTest) return;
        setFormData({
            patientId: stressTest.patientId,
            providerId: stressTest.providerId || '',
            visitId: stressTest.visitId || '',
            performedAt: formatDateTimeLocal(new Date(stressTest.performedAt)),
            status: stressTest.status,
            type: stressTest.type || '',
            protocol: stressTest.protocol || '',
            durationMinutes: stressTest.durationMinutes?.toString() || '',
            mets: stressTest.mets?.toString() || '',
            maxHeartRate: stressTest.maxHeartRate?.toString() || '',
            maxBpSystolic: stressTest.maxBpSystolic?.toString() || '',
            maxBpDiastolic: stressTest.maxBpDiastolic?.toString() || '',
            symptoms: stressTest.symptoms || '',
            result: stressTest.result || '',
            notes: stressTest.notes || '',
        });
        if (stressTest.patient) {
            setPatientInput(`${stressTest.patient.firstName} ${stressTest.patient.lastName}`);
        } else {
            setPatientInput(stressTest.patientId);
        }
        if (stressTest.provider) {
            const prefix = stressTest.provider.role === 'DOCTOR' ? 'Dr. ' : '';
            setProviderInput(`${prefix}${stressTest.provider.firstName} ${stressTest.provider.lastName}`);
        } else if (stressTest.providerId) {
            setProviderInput(stressTest.providerId);
        }
        if (stressTest.visit) {
            setVisitInput(`${formatDateTime(stressTest.visit.visitDate)} · ${stressTest.visit.id}`);
        } else if (stressTest.visitId) {
            setVisitInput(stressTest.visitId);
        }
    }, [stressTest]);

    const createMutation = useMutation({
        mutationFn: (payload: CreateCardiologyStressTestRequest) => cardiologyStressTestService.createStressTest(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cardiology-stress-tests'] });
            navigate('/cardiology/stress-tests');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (payload: CreateCardiologyStressTestRequest) => cardiologyStressTestService.updateStressTest(id!, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cardiology-stress-tests'] });
            queryClient.invalidateQueries({ queryKey: ['cardiology-stress-test', id] });
            navigate('/cardiology/stress-tests');
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

        const payload: CreateCardiologyStressTestRequest = {
            patientId: formData.patientId,
            providerId: formData.providerId || undefined,
            visitId: formData.visitId || undefined,
            status: formData.status,
            performedAt: formData.performedAt,
            type: formData.type || undefined,
            protocol: formData.protocol || undefined,
            durationMinutes: toNumber(formData.durationMinutes),
            mets: toNumber(formData.mets),
            maxHeartRate: toNumber(formData.maxHeartRate),
            maxBpSystolic: toNumber(formData.maxBpSystolic),
            maxBpDiastolic: toNumber(formData.maxBpDiastolic),
            symptoms: formData.symptoms || undefined,
            result: formData.result || undefined,
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
                        {isEditMode ? 'Edit Stress Test' : 'New Stress Test'}
                    </h1>
                    <p className="text-gray-500 mt-1">Record protocol details and results.</p>
                </div>
                <Link to="/cardiology/stress-tests">
                    <Button variant="outline">
                        <ArrowLeft size={18} className="mr-2" />
                        Back to Stress Tests
                    </Button>
                </Link>
            </div>

            <CardiologyNav />

            <Card>
                <CardHeader>
                    <CardTitle>Stress Test Details</CardTitle>
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
                                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as CardiologyTestStatus }))}
                                >
                                    {statusOptions.map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                            <Input
                                label="Type"
                                value={formData.type}
                                onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                                placeholder="Treadmill, Pharmacologic"
                            />
                            <Input
                                label="Protocol"
                                value={formData.protocol}
                                onChange={(e) => setFormData((prev) => ({ ...prev, protocol: e.target.value }))}
                                placeholder="Bruce, Modified Bruce"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Input
                                label="Duration (min)"
                                value={formData.durationMinutes}
                                onChange={(e) => setFormData((prev) => ({ ...prev, durationMinutes: e.target.value }))}
                            />
                            <Input
                                label="METS"
                                value={formData.mets}
                                onChange={(e) => setFormData((prev) => ({ ...prev, mets: e.target.value }))}
                            />
                            <Input
                                label="Max Heart Rate"
                                value={formData.maxHeartRate}
                                onChange={(e) => setFormData((prev) => ({ ...prev, maxHeartRate: e.target.value }))}
                            />
                            <Input
                                label="Max Systolic BP"
                                value={formData.maxBpSystolic}
                                onChange={(e) => setFormData((prev) => ({ ...prev, maxBpSystolic: e.target.value }))}
                            />
                            <Input
                                label="Max Diastolic BP"
                                value={formData.maxBpDiastolic}
                                onChange={(e) => setFormData((prev) => ({ ...prev, maxBpDiastolic: e.target.value }))}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <Input
                                label="Symptoms"
                                value={formData.symptoms}
                                onChange={(e) => setFormData((prev) => ({ ...prev, symptoms: e.target.value }))}
                                placeholder="Chest pain, dizziness"
                            />
                            <Input
                                label="Result"
                                value={formData.result}
                                onChange={(e) => setFormData((prev) => ({ ...prev, result: e.target.value }))}
                                placeholder="Positive, negative, equivocal"
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
                                {isEditMode ? 'Update Stress Test' : 'Create Stress Test'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
