import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cardiologyProcedureService } from '../../services/cardiology-procedure.service';
import { cardiologyService } from '../../services/cardiology.service';
import { providerService } from '../../services/provider.service';
import { patientService } from '../../services/patient.service';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, SearchableSelect } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import type { CardiologyProcedureStatus, CreateCardiologyProcedureRequest } from '../../types';
import type { SelectOption } from '../../components/ui/SearchableSelect';
import { formatDateTime } from '../../lib/utils';
import { CardiologyNav } from './CardiologyNav';

const statusOptions: CardiologyProcedureStatus[] = [
    'SCHEDULED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
];

const formatDateTimeLocal = (value: Date) => {
    const local = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
};

type ProcedureFormState = {
    patientId: string;
    providerId: string;
    visitId: string;
    procedureDate: string;
    status: CardiologyProcedureStatus;
    type: string;
    indication: string;
    findings: string;
    complications: string;
    outcome: string;
    notes: string;
};

export function CardiologyProcedureFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const isEditMode = Boolean(id);
    const [patientInput, setPatientInput] = useState('');
    const [providerInput, setProviderInput] = useState('');
    const [visitInput, setVisitInput] = useState('');

    const defaultProcedureDate = useMemo(() => formatDateTimeLocal(new Date()), []);

    const [formData, setFormData] = useState<ProcedureFormState>({
        patientId: '',
        providerId: '',
        visitId: '',
        procedureDate: defaultProcedureDate,
        status: 'SCHEDULED',
        type: '',
        indication: '',
        findings: '',
        complications: '',
        outcome: '',
        notes: '',
    });

    const { data: procedure, isLoading } = useQuery({
        queryKey: ['cardiology-procedure', id],
        queryFn: () => cardiologyProcedureService.getProcedure(id!),
        enabled: isEditMode,
    });

    const patientSearch = patientInput.trim();
    const providerSearch = providerInput.trim();
    const visitSearch = visitInput.trim();

    const { data: patientsData, isLoading: isPatientsLoading } = useQuery({
        queryKey: ['patients', 'cardiology-procedure-picker', patientSearch],
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
        queryKey: ['providers', 'cardiology-procedure-picker', providerSearch],
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
        queryKey: ['cardiology-visits', 'procedure-picker', visitSearch],
        queryFn: () =>
            cardiologyService.getVisits({
                page: 1,
                limit: 10,
                search: visitSearch || undefined,
            }),
    });

    useEffect(() => {
        if (!procedure) return;
        setFormData({
            patientId: procedure.patientId,
            providerId: procedure.providerId || '',
            visitId: procedure.visitId || '',
            procedureDate: formatDateTimeLocal(new Date(procedure.procedureDate)),
            status: procedure.status,
            type: procedure.type || '',
            indication: procedure.indication || '',
            findings: procedure.findings || '',
            complications: procedure.complications || '',
            outcome: procedure.outcome || '',
            notes: procedure.notes || '',
        });
        if (procedure.patient) {
            setPatientInput(`${procedure.patient.firstName} ${procedure.patient.lastName}`);
        } else {
            setPatientInput(procedure.patientId);
        }
        if (procedure.provider) {
            const prefix = procedure.provider.role === 'DOCTOR' ? 'Dr. ' : '';
            setProviderInput(`${prefix}${procedure.provider.firstName} ${procedure.provider.lastName}`);
        } else if (procedure.providerId) {
            setProviderInput(procedure.providerId);
        }
        if (procedure.visit) {
            setVisitInput(`${formatDateTime(procedure.visit.visitDate)} · ${procedure.visit.id}`);
        } else if (procedure.visitId) {
            setVisitInput(procedure.visitId);
        }
    }, [procedure]);

    const createMutation = useMutation({
        mutationFn: (payload: CreateCardiologyProcedureRequest) => cardiologyProcedureService.createProcedure(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cardiology-procedures'] });
            navigate('/cardiology/procedures');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (payload: CreateCardiologyProcedureRequest) => cardiologyProcedureService.updateProcedure(id!, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cardiology-procedures'] });
            queryClient.invalidateQueries({ queryKey: ['cardiology-procedure', id] });
            navigate('/cardiology/procedures');
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

        const payload: CreateCardiologyProcedureRequest = {
            patientId: formData.patientId,
            providerId: formData.providerId || undefined,
            visitId: formData.visitId || undefined,
            status: formData.status,
            procedureDate: formData.procedureDate,
            type: formData.type || undefined,
            indication: formData.indication || undefined,
            findings: formData.findings || undefined,
            complications: formData.complications || undefined,
            outcome: formData.outcome || undefined,
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
                        {isEditMode ? 'Edit Procedure' : 'New Procedure'}
                    </h1>
                    <p className="text-gray-500 mt-1">Document cath lab and interventional procedures.</p>
                </div>
                <Link to="/cardiology/procedures">
                    <Button variant="outline">
                        <ArrowLeft size={18} className="mr-2" />
                        Back to Procedures
                    </Button>
                </Link>
            </div>

            <CardiologyNav />

            <Card>
                <CardHeader>
                    <CardTitle>Procedure Details</CardTitle>
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
                                label="Procedure Date"
                                type="datetime-local"
                                value={formData.procedureDate}
                                onChange={(e) => setFormData((prev) => ({ ...prev, procedureDate: e.target.value }))}
                                required
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                                    value={formData.status}
                                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as CardiologyProcedureStatus }))}
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
                                placeholder="Coronary angiography, PCI"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <Input
                                label="Indication"
                                value={formData.indication}
                                onChange={(e) => setFormData((prev) => ({ ...prev, indication: e.target.value }))}
                            />
                            <Input
                                label="Findings"
                                value={formData.findings}
                                onChange={(e) => setFormData((prev) => ({ ...prev, findings: e.target.value }))}
                            />
                            <Input
                                label="Complications"
                                value={formData.complications}
                                onChange={(e) => setFormData((prev) => ({ ...prev, complications: e.target.value }))}
                            />
                            <Input
                                label="Outcome"
                                value={formData.outcome}
                                onChange={(e) => setFormData((prev) => ({ ...prev, outcome: e.target.value }))}
                            />
                            <Input
                                label="Notes"
                                value={formData.notes}
                                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                <Save size={18} className="mr-2" />
                                {isEditMode ? 'Update Procedure' : 'Create Procedure'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
