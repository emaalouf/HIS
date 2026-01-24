import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cardiologyEcgService } from '../../services/cardiology-ecg.service';
import { cardiologyService } from '../../services/cardiology.service';
import { providerService } from '../../services/provider.service';
import { patientService } from '../../services/patient.service';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, SearchableSelect } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import type { CardiologyTestStatus, CreateCardiologyEcgRequest } from '../../types';
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

type EcgFormState = {
    patientId: string;
    providerId: string;
    visitId: string;
    recordedAt: string;
    status: CardiologyTestStatus;
    type: string;
    rhythm: string;
    heartRate: string;
    prInterval: string;
    qrsDuration: string;
    qtInterval: string;
    qtc: string;
    interpretation: string;
    notes: string;
};

export function CardiologyEcgFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const isEditMode = Boolean(id);
    const [patientInput, setPatientInput] = useState('');
    const [providerInput, setProviderInput] = useState('');
    const [visitInput, setVisitInput] = useState('');

    const defaultRecordedAt = useMemo(() => formatDateTimeLocal(new Date()), []);

    const [formData, setFormData] = useState<EcgFormState>({
        patientId: '',
        providerId: '',
        visitId: '',
        recordedAt: defaultRecordedAt,
        status: 'ORDERED',
        type: '',
        rhythm: '',
        heartRate: '',
        prInterval: '',
        qrsDuration: '',
        qtInterval: '',
        qtc: '',
        interpretation: '',
        notes: '',
    });

    const { data: ecg, isLoading } = useQuery({
        queryKey: ['cardiology-ecg', id],
        queryFn: () => cardiologyEcgService.getEcg(id!),
        enabled: isEditMode,
    });

    const patientSearch = patientInput.trim();
    const providerSearch = providerInput.trim();
    const visitSearch = visitInput.trim();

    const { data: patientsData, isLoading: isPatientsLoading } = useQuery({
        queryKey: ['patients', 'cardiology-ecg-picker', patientSearch],
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
        queryKey: ['providers', 'cardiology-ecg-picker', providerSearch],
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
        queryKey: ['cardiology-visits', 'ecg-picker', visitSearch],
        queryFn: () =>
            cardiologyService.getVisits({
                page: 1,
                limit: 10,
                search: visitSearch || undefined,
            }),
    });

    useEffect(() => {
        if (!ecg) return;
        setFormData({
            patientId: ecg.patientId,
            providerId: ecg.providerId || '',
            visitId: ecg.visitId || '',
            recordedAt: formatDateTimeLocal(new Date(ecg.recordedAt)),
            status: ecg.status,
            type: ecg.type || '',
            rhythm: ecg.rhythm || '',
            heartRate: ecg.heartRate?.toString() || '',
            prInterval: ecg.prInterval?.toString() || '',
            qrsDuration: ecg.qrsDuration?.toString() || '',
            qtInterval: ecg.qtInterval?.toString() || '',
            qtc: ecg.qtc?.toString() || '',
            interpretation: ecg.interpretation || '',
            notes: ecg.notes || '',
        });
        if (ecg.patient) {
            setPatientInput(`${ecg.patient.firstName} ${ecg.patient.lastName}`);
        } else {
            setPatientInput(ecg.patientId);
        }
        if (ecg.provider) {
            const prefix = ecg.provider.role === 'DOCTOR' ? 'Dr. ' : '';
            setProviderInput(`${prefix}${ecg.provider.firstName} ${ecg.provider.lastName}`);
        } else if (ecg.providerId) {
            setProviderInput(ecg.providerId);
        }
        if (ecg.visit) {
            setVisitInput(`${formatDateTime(ecg.visit.visitDate)} · ${ecg.visit.id}`);
        } else if (ecg.visitId) {
            setVisitInput(ecg.visitId);
        }
    }, [ecg]);

    const createMutation = useMutation({
        mutationFn: (payload: CreateCardiologyEcgRequest) => cardiologyEcgService.createEcg(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cardiology-ecgs'] });
            navigate('/cardiology/ecgs');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (payload: CreateCardiologyEcgRequest) => cardiologyEcgService.updateEcg(id!, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cardiology-ecgs'] });
            queryClient.invalidateQueries({ queryKey: ['cardiology-ecg', id] });
            navigate('/cardiology/ecgs');
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

        const payload: CreateCardiologyEcgRequest = {
            patientId: formData.patientId,
            providerId: formData.providerId || undefined,
            visitId: formData.visitId || undefined,
            status: formData.status,
            recordedAt: formData.recordedAt,
            type: formData.type || undefined,
            rhythm: formData.rhythm || undefined,
            heartRate: toNumber(formData.heartRate),
            prInterval: toNumber(formData.prInterval),
            qrsDuration: toNumber(formData.qrsDuration),
            qtInterval: toNumber(formData.qtInterval),
            qtc: toNumber(formData.qtc),
            interpretation: formData.interpretation || undefined,
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
                        {isEditMode ? 'Edit ECG' : 'New ECG'}
                    </h1>
                    <p className="text-gray-500 mt-1">Capture ECG timing, rhythm, and interpretation.</p>
                </div>
                <Link to="/cardiology/ecgs">
                    <Button variant="outline">
                        <ArrowLeft size={18} className="mr-2" />
                        Back to ECGs
                    </Button>
                </Link>
            </div>

            <CardiologyNav />

            <Card>
                <CardHeader>
                    <CardTitle>ECG Details</CardTitle>
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
                                placeholder="Resting, Holter, Stress ECG"
                            />
                            <Input
                                label="Rhythm"
                                value={formData.rhythm}
                                onChange={(e) => setFormData((prev) => ({ ...prev, rhythm: e.target.value }))}
                                placeholder="Normal sinus rhythm"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            <Input
                                label="Heart Rate (bpm)"
                                value={formData.heartRate}
                                onChange={(e) => setFormData((prev) => ({ ...prev, heartRate: e.target.value }))}
                            />
                            <Input
                                label="PR Interval (ms)"
                                value={formData.prInterval}
                                onChange={(e) => setFormData((prev) => ({ ...prev, prInterval: e.target.value }))}
                            />
                            <Input
                                label="QRS Duration (ms)"
                                value={formData.qrsDuration}
                                onChange={(e) => setFormData((prev) => ({ ...prev, qrsDuration: e.target.value }))}
                            />
                            <Input
                                label="QT Interval (ms)"
                                value={formData.qtInterval}
                                onChange={(e) => setFormData((prev) => ({ ...prev, qtInterval: e.target.value }))}
                                placeholder="QT"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Input
                                label="QTc (ms)"
                                value={formData.qtc}
                                onChange={(e) => setFormData((prev) => ({ ...prev, qtc: e.target.value }))}
                            />
                            <Input
                                label="Interpretation"
                                value={formData.interpretation}
                                onChange={(e) => setFormData((prev) => ({ ...prev, interpretation: e.target.value }))}
                                placeholder="Summary interpretation"
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
                                {isEditMode ? 'Update ECG' : 'Create ECG'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
