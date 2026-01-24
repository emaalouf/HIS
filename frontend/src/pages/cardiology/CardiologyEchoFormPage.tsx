import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cardiologyEchoService } from '../../services/cardiology-echo.service';
import { cardiologyService } from '../../services/cardiology.service';
import { providerService } from '../../services/provider.service';
import { patientService } from '../../services/patient.service';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, SearchableSelect } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import type { CardiologyTestStatus, CreateCardiologyEchoRequest } from '../../types';
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

type EchoFormState = {
    patientId: string;
    providerId: string;
    visitId: string;
    performedAt: string;
    status: CardiologyTestStatus;
    type: string;
    lvef: string;
    lvEndDiastolicDia: string;
    lvEndSystolicDia: string;
    rvFunction: string;
    valveFindings: string;
    wallMotion: string;
    pericardialEffusion: string;
    summary: string;
    notes: string;
};

export function CardiologyEchoFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const isEditMode = Boolean(id);
    const [patientInput, setPatientInput] = useState('');
    const [providerInput, setProviderInput] = useState('');
    const [visitInput, setVisitInput] = useState('');

    const defaultPerformedAt = useMemo(() => formatDateTimeLocal(new Date()), []);

    const [formData, setFormData] = useState<EchoFormState>({
        patientId: '',
        providerId: '',
        visitId: '',
        performedAt: defaultPerformedAt,
        status: 'ORDERED',
        type: '',
        lvef: '',
        lvEndDiastolicDia: '',
        lvEndSystolicDia: '',
        rvFunction: '',
        valveFindings: '',
        wallMotion: '',
        pericardialEffusion: '',
        summary: '',
        notes: '',
    });

    const { data: echo, isLoading } = useQuery({
        queryKey: ['cardiology-echo', id],
        queryFn: () => cardiologyEchoService.getEcho(id!),
        enabled: isEditMode,
    });

    const patientSearch = patientInput.trim();
    const providerSearch = providerInput.trim();
    const visitSearch = visitInput.trim();

    const { data: patientsData, isLoading: isPatientsLoading } = useQuery({
        queryKey: ['patients', 'cardiology-echo-picker', patientSearch],
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
        queryKey: ['providers', 'cardiology-echo-picker', providerSearch],
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
        queryKey: ['cardiology-visits', 'echo-picker', visitSearch],
        queryFn: () =>
            cardiologyService.getVisits({
                page: 1,
                limit: 10,
                search: visitSearch || undefined,
            }),
    });

    useEffect(() => {
        if (!echo) return;
        setFormData({
            patientId: echo.patientId,
            providerId: echo.providerId || '',
            visitId: echo.visitId || '',
            performedAt: formatDateTimeLocal(new Date(echo.performedAt)),
            status: echo.status,
            type: echo.type || '',
            lvef: echo.lvef?.toString() || '',
            lvEndDiastolicDia: echo.lvEndDiastolicDia?.toString() || '',
            lvEndSystolicDia: echo.lvEndSystolicDia?.toString() || '',
            rvFunction: echo.rvFunction || '',
            valveFindings: echo.valveFindings || '',
            wallMotion: echo.wallMotion || '',
            pericardialEffusion: echo.pericardialEffusion === undefined ? '' : echo.pericardialEffusion ? 'true' : 'false',
            summary: echo.summary || '',
            notes: echo.notes || '',
        });
        if (echo.patient) {
            setPatientInput(`${echo.patient.firstName} ${echo.patient.lastName}`);
        } else {
            setPatientInput(echo.patientId);
        }
        if (echo.provider) {
            const prefix = echo.provider.role === 'DOCTOR' ? 'Dr. ' : '';
            setProviderInput(`${prefix}${echo.provider.firstName} ${echo.provider.lastName}`);
        } else if (echo.providerId) {
            setProviderInput(echo.providerId);
        }
        if (echo.visit) {
            setVisitInput(`${formatDateTime(echo.visit.visitDate)} · ${echo.visit.id}`);
        } else if (echo.visitId) {
            setVisitInput(echo.visitId);
        }
    }, [echo]);

    const createMutation = useMutation({
        mutationFn: (payload: CreateCardiologyEchoRequest) => cardiologyEchoService.createEcho(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cardiology-echos'] });
            navigate('/cardiology/echos');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (payload: CreateCardiologyEchoRequest) => cardiologyEchoService.updateEcho(id!, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cardiology-echos'] });
            queryClient.invalidateQueries({ queryKey: ['cardiology-echo', id] });
            navigate('/cardiology/echos');
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

        const payload: CreateCardiologyEchoRequest = {
            patientId: formData.patientId,
            providerId: formData.providerId || undefined,
            visitId: formData.visitId || undefined,
            status: formData.status,
            performedAt: formData.performedAt,
            type: formData.type || undefined,
            lvef: toNumber(formData.lvef),
            lvEndDiastolicDia: toNumber(formData.lvEndDiastolicDia),
            lvEndSystolicDia: toNumber(formData.lvEndSystolicDia),
            rvFunction: formData.rvFunction || undefined,
            valveFindings: formData.valveFindings || undefined,
            wallMotion: formData.wallMotion || undefined,
            pericardialEffusion: formData.pericardialEffusion === '' ? undefined : formData.pericardialEffusion === 'true',
            summary: formData.summary || undefined,
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
                        {isEditMode ? 'Edit Echo' : 'New Echo'}
                    </h1>
                    <p className="text-gray-500 mt-1">Capture echo measurements and interpretation.</p>
                </div>
                <Link to="/cardiology/echos">
                    <Button variant="outline">
                        <ArrowLeft size={18} className="mr-2" />
                        Back to Echos
                    </Button>
                </Link>
            </div>

            <CardiologyNav />

            <Card>
                <CardHeader>
                    <CardTitle>Echo Details</CardTitle>
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
                                placeholder="Transthoracic, TEE, Stress echo"
                            />
                            <Input
                                label="LVEF (%)"
                                value={formData.lvef}
                                onChange={(e) => setFormData((prev) => ({ ...prev, lvef: e.target.value }))}
                            />
                            <Input
                                label="LV End Diastolic Diameter (cm)"
                                value={formData.lvEndDiastolicDia}
                                onChange={(e) => setFormData((prev) => ({ ...prev, lvEndDiastolicDia: e.target.value }))}
                            />
                            <Input
                                label="LV End Systolic Diameter (cm)"
                                value={formData.lvEndSystolicDia}
                                onChange={(e) => setFormData((prev) => ({ ...prev, lvEndSystolicDia: e.target.value }))}
                            />
                            <Input
                                label="RV Function"
                                value={formData.rvFunction}
                                onChange={(e) => setFormData((prev) => ({ ...prev, rvFunction: e.target.value }))}
                                placeholder="Normal, mildly reduced"
                            />
                            <Input
                                label="Valve Findings"
                                value={formData.valveFindings}
                                onChange={(e) => setFormData((prev) => ({ ...prev, valveFindings: e.target.value }))}
                            />
                            <Input
                                label="Wall Motion"
                                value={formData.wallMotion}
                                onChange={(e) => setFormData((prev) => ({ ...prev, wallMotion: e.target.value }))}
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pericardial Effusion</label>
                                <select
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                                    value={formData.pericardialEffusion}
                                    onChange={(e) => setFormData(prev => ({ ...prev, pericardialEffusion: e.target.value }))}
                                >
                                    <option value="">Unknown</option>
                                    <option value="true">Present</option>
                                    <option value="false">Absent</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <Input
                                label="Summary"
                                value={formData.summary}
                                onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.value }))}
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
                                {isEditMode ? 'Update Echo' : 'Create Echo'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
