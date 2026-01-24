import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { nephrologyBiopsyService } from '../../services/nephrology-biopsy.service';
import { nephrologyService } from '../../services/nephrology.service';
import { providerService } from '../../services/provider.service';
import { patientService } from '../../services/patient.service';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, SearchableSelect } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import type { CreateNephrologyBiopsyRequest, NephrologyProcedureStatus } from '../../types';
import type { SelectOption } from '../../components/ui/SearchableSelect';
import { formatDateTime } from '../../lib/utils';
import { NephrologyNav } from './NephrologyNav';

const statusOptions: NephrologyProcedureStatus[] = [
    'SCHEDULED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
];

const formatDateTimeLocal = (value: Date) => {
    const local = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
};

type BiopsyFormState = {
    patientId: string;
    providerId: string;
    visitId: string;
    performedAt: string;
    status: NephrologyProcedureStatus;
    indication: string;
    specimenType: string;
    pathologySummary: string;
    complications: string;
    notes: string;
};

export function NephrologyBiopsyFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const isEditMode = Boolean(id);
    const [patientInput, setPatientInput] = useState('');
    const [providerInput, setProviderInput] = useState('');
    const [visitInput, setVisitInput] = useState('');

    const defaultPerformedAt = useMemo(() => formatDateTimeLocal(new Date()), []);

    const [formData, setFormData] = useState<BiopsyFormState>({
        patientId: '',
        providerId: '',
        visitId: '',
        performedAt: defaultPerformedAt,
        status: 'SCHEDULED',
        indication: '',
        specimenType: '',
        pathologySummary: '',
        complications: '',
        notes: '',
    });

    const { data: biopsy, isLoading } = useQuery({
        queryKey: ['nephrology-biopsy', id],
        queryFn: () => nephrologyBiopsyService.getBiopsy(id!),
        enabled: isEditMode,
    });

    const patientSearch = patientInput.trim();
    const providerSearch = providerInput.trim();
    const visitSearch = visitInput.trim();

    const { data: patientsData, isLoading: isPatientsLoading } = useQuery({
        queryKey: ['patients', 'nephrology-biopsy-picker', patientSearch],
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
        queryKey: ['providers', 'nephrology-biopsy-picker', providerSearch],
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
        queryKey: ['nephrology-visits', 'biopsy-picker', visitSearch],
        queryFn: () =>
            nephrologyService.getVisits({
                page: 1,
                limit: 10,
                search: visitSearch || undefined,
            }),
    });

    useEffect(() => {
        if (!biopsy) return;
        setFormData({
            patientId: biopsy.patientId,
            providerId: biopsy.providerId || '',
            visitId: biopsy.visitId || '',
            performedAt: formatDateTimeLocal(new Date(biopsy.performedAt)),
            status: biopsy.status,
            indication: biopsy.indication || '',
            specimenType: biopsy.specimenType || '',
            pathologySummary: biopsy.pathologySummary || '',
            complications: biopsy.complications || '',
            notes: biopsy.notes || '',
        });
        if (biopsy.patient) {
            setPatientInput(`${biopsy.patient.firstName} ${biopsy.patient.lastName}`);
        } else {
            setPatientInput(biopsy.patientId);
        }
        if (biopsy.provider) {
            const prefix = biopsy.provider.role === 'DOCTOR' ? 'Dr. ' : '';
            setProviderInput(`${prefix}${biopsy.provider.firstName} ${biopsy.provider.lastName}`);
        } else if (biopsy.providerId) {
            setProviderInput(biopsy.providerId);
        }
        if (biopsy.visit) {
            setVisitInput(`${formatDateTime(biopsy.visit.visitDate)} - ${biopsy.visit.id}`);
        } else if (biopsy.visitId) {
            setVisitInput(biopsy.visitId);
        }
    }, [biopsy]);

    const createMutation = useMutation({
        mutationFn: (payload: CreateNephrologyBiopsyRequest) => nephrologyBiopsyService.createBiopsy(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['nephrology-biopsies'] });
            navigate('/nephrology/biopsies');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (payload: CreateNephrologyBiopsyRequest) => nephrologyBiopsyService.updateBiopsy(id!, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['nephrology-biopsies'] });
            queryClient.invalidateQueries({ queryKey: ['nephrology-biopsy', id] });
            navigate('/nephrology/biopsies');
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

        const payload: CreateNephrologyBiopsyRequest = {
            patientId: formData.patientId,
            providerId: formData.providerId || undefined,
            visitId: formData.visitId || undefined,
            status: formData.status,
            performedAt: formData.performedAt,
            indication: formData.indication || undefined,
            specimenType: formData.specimenType || undefined,
            pathologySummary: formData.pathologySummary || undefined,
            complications: formData.complications || undefined,
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
        label: `${visit.patient ? `${visit.patient.firstName} ${visit.patient.lastName}` : visit.patientId} - ${formatDateTime(visit.visitDate)}`,
        subLabel: visit.reason || visit.status,
    }));

    if (isEditMode && isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    if (isEditMode && !biopsy) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Biopsy not found</p>
                <Link to="/nephrology/biopsies" className="text-emerald-600 hover:underline mt-2 inline-block">
                    Back to biopsies
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6 lg:pl-0">
            <div className="flex items-center gap-4 pt-2 lg:pt-0">
                <Link to="/nephrology/biopsies">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft size={18} className="mr-2" />
                        Back
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEditMode ? 'Edit Biopsy' : 'New Biopsy'}
                </h1>
            </div>

            <NephrologyNav />

            <Card>
                <CardHeader>
                    <CardTitle>Biopsy Details</CardTitle>
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
                                label="Associated Visit"
                                placeholder="Link to nephrology visit..."
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
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, status: e.target.value as NephrologyProcedureStatus }))
                                    }
                                >
                                    {statusOptions.map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <Input
                                label="Indication"
                                value={formData.indication}
                                onChange={(e) => setFormData((prev) => ({ ...prev, indication: e.target.value }))}
                                placeholder="Reason for biopsy"
                            />
                            <Input
                                label="Specimen Type"
                                value={formData.specimenType}
                                onChange={(e) => setFormData((prev) => ({ ...prev, specimenType: e.target.value }))}
                                placeholder="e.g. Native kidney"
                            />
                            <Input
                                label="Pathology Summary"
                                value={formData.pathologySummary}
                                onChange={(e) => setFormData((prev) => ({ ...prev, pathologySummary: e.target.value }))}
                                placeholder="Key pathology findings"
                            />
                            <Input
                                label="Complications"
                                value={formData.complications}
                                onChange={(e) => setFormData((prev) => ({ ...prev, complications: e.target.value }))}
                                placeholder="Any complications"
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
                                {isEditMode ? 'Update Biopsy' : 'Create Biopsy'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
