import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cardiologyElectrophysiologyService } from '../../services/cardiology-electrophysiology.service';
import { cardiologyService } from '../../services/cardiology.service';
import { providerService } from '../../services/provider.service';
import { patientService } from '../../services/patient.service';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, SearchableSelect } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import type { CardiologyTestStatus, ElectrophysiologyProcedureType, CreateCardiologyElectrophysiologyRequest } from '../../types';
import type { SelectOption } from '../../components/ui/SearchableSelect';
import { formatDateTime } from '../../lib/utils';
import { CardiologyNav } from './CardiologyNav';

const statusOptions: CardiologyTestStatus[] = [
    'ORDERED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
];

const procedureTypeOptions: ElectrophysiologyProcedureType[] = [
    'PACEMAKER_IMPLANT',
    'ICD_IMPLANT',
    'CRT_IMPLANT',
    'ABLATION',
    'ELECTROPHYSIOLOGY_STUDY',
    'LOOP_RECORDER_IMPLANT',
    'LEAD_EXTRACTION',
    'OTHER',
];

const formatDateTimeLocal = (value: Date) => {
    const local = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
};

type ElectrophysiologyFormState = {
    patientId: string;
    providerId: string;
    visitId: string;
    performedAt: string;
    status: CardiologyTestStatus;
    procedureType: ElectrophysiologyProcedureType;
    indication: string;
    arrhythmiaType: string;
    deviceType: string;
    manufacturer: string;
    model: string;
    serialNumber: string;
    implantDate: string;
    ablationTarget: string;
    fluoroscopyTime: string;
    complications: string;
    outcome: string;
    followUpDate: string;
    notes: string;
};

export function CardiologyElectrophysiologyFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const isEditMode = Boolean(id);
    const [patientInput, setPatientInput] = useState('');
    const [providerInput, setProviderInput] = useState('');
    const [visitInput, setVisitInput] = useState('');

    const defaultPerformedAt = useMemo(() => formatDateTimeLocal(new Date()), []);

    const [formData, setFormData] = useState<ElectrophysiologyFormState>({
        patientId: '',
        providerId: '',
        visitId: '',
        performedAt: defaultPerformedAt,
        status: 'ORDERED',
        procedureType: 'PACEMAKER_IMPLANT',
        indication: '',
        arrhythmiaType: '',
        deviceType: '',
        manufacturer: '',
        model: '',
        serialNumber: '',
        implantDate: '',
        ablationTarget: '',
        fluoroscopyTime: '',
        complications: '',
        outcome: '',
        followUpDate: '',
        notes: '',
    });

    const { data: study, isLoading } = useQuery({
        queryKey: ['cardiology-electrophysiology', id],
        queryFn: () => cardiologyElectrophysiologyService.getStudy(id!),
        enabled: isEditMode,
    });

    const patientSearch = patientInput.trim();
    const providerSearch = providerInput.trim();
    const visitSearch = visitInput.trim();

    const { data: patientsData, isLoading: isPatientsLoading } = useQuery({
        queryKey: ['patients', 'electrophysiology-picker', patientSearch],
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
        queryKey: ['providers', 'electrophysiology-picker', providerSearch],
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
        queryKey: ['cardiology-visits', 'electrophysiology-picker', visitSearch],
        queryFn: () =>
            cardiologyService.getVisits({
                page: 1,
                limit: 10,
                search: visitSearch || undefined,
            }),
    });

    useEffect(() => {
        if (!study) return;
        setFormData({
            patientId: study.patientId,
            providerId: study.providerId || '',
            visitId: study.visitId || '',
            performedAt: formatDateTimeLocal(new Date(study.performedAt)),
            status: study.status,
            procedureType: study.procedureType,
            indication: study.indication || '',
            arrhythmiaType: study.arrhythmiaType || '',
            deviceType: study.deviceType || '',
            manufacturer: study.manufacturer || '',
            model: study.model || '',
            serialNumber: study.serialNumber || '',
            implantDate: study.implantDate ? formatDateTimeLocal(new Date(study.implantDate)) : '',
            ablationTarget: study.ablationTarget || '',
            fluoroscopyTime: study.fluoroscopyTime?.toString() || '',
            complications: study.complications || '',
            outcome: study.outcome || '',
            followUpDate: study.followUpDate ? formatDateTimeLocal(new Date(study.followUpDate)) : '',
            notes: study.notes || '',
        });
        if (study.patient) {
            setPatientInput(`${study.patient.firstName} ${study.patient.lastName}`);
        } else {
            setPatientInput(study.patientId);
        }
        if (study.provider) {
            const prefix = study.provider.role === 'DOCTOR' ? 'Dr. ' : '';
            setProviderInput(`${prefix}${study.provider.firstName} ${study.provider.lastName}`);
        } else if (study.providerId) {
            setProviderInput(study.providerId);
        }
        if (study.visit) {
            setVisitInput(`${formatDateTime(study.visit.visitDate)} · ${study.visit.id}`);
        } else if (study.visitId) {
            setVisitInput(study.visitId);
        }
    }, [study]);

    const createMutation = useMutation({
        mutationFn: (payload: CreateCardiologyElectrophysiologyRequest) => cardiologyElectrophysiologyService.createStudy(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cardiology-electrophysiology'] });
            navigate('/cardiology/electrophysiology');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (payload: CreateCardiologyElectrophysiologyRequest) => cardiologyElectrophysiologyService.updateStudy(id!, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cardiology-electrophysiology'] });
            queryClient.invalidateQueries({ queryKey: ['cardiology-electrophysiology', id] });
            navigate('/cardiology/electrophysiology');
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

        const payload: CreateCardiologyElectrophysiologyRequest = {
            patientId: formData.patientId,
            providerId: formData.providerId || undefined,
            visitId: formData.visitId || undefined,
            status: formData.status,
            performedAt: formData.performedAt,
            procedureType: formData.procedureType,
            indication: formData.indication || undefined,
            arrhythmiaType: formData.arrhythmiaType || undefined,
            deviceType: formData.deviceType || undefined,
            manufacturer: formData.manufacturer || undefined,
            model: formData.model || undefined,
            serialNumber: formData.serialNumber || undefined,
            implantDate: formData.implantDate || undefined,
            ablationTarget: formData.ablationTarget || undefined,
            fluoroscopyTime: toNumber(formData.fluoroscopyTime),
            complications: formData.complications || undefined,
            outcome: formData.outcome || undefined,
            followUpDate: formData.followUpDate || undefined,
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
                        {isEditMode ? 'Edit Electrophysiology Study' : 'New Electrophysiology Study'}
                    </h1>
                    <p className="text-gray-500 mt-1">Manage pacemakers, ICDs, ablations, and other EP procedures.</p>
                </div>
                <Link to="/cardiology/electrophysiology">
                    <Button variant="outline">
                        <ArrowLeft size={18} className="mr-2" />
                        Back to Studies
                    </Button>
                </Link>
            </div>

            <CardiologyNav />

            <Card>
                <CardHeader>
                    <CardTitle>Electrophysiology Study Details</CardTitle>
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Procedure Type</label>
                                <select
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                                    value={formData.procedureType}
                                    onChange={(e) => setFormData(prev => ({ ...prev, procedureType: e.target.value as ElectrophysiologyProcedureType }))}
                                    required
                                >
                                    {procedureTypeOptions.map((option) => (
                                        <option key={option} value={option}>{option.split('_').join(' ')}</option>
                                    ))}
                                </select>
                            </div>
                            <Input
                                label="Indication"
                                value={formData.indication}
                                onChange={(e) => setFormData((prev) => ({ ...prev, indication: e.target.value }))}
                                placeholder="Reason for procedure"
                            />
                            <Input
                                label="Arrhythmia Type"
                                value={formData.arrhythmiaType}
                                onChange={(e) => setFormData((prev) => ({ ...prev, arrhythmiaType: e.target.value }))}
                                placeholder="e.g., Atrial fibrillation, VT, SVT"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            <Input
                                label="Device Type"
                                value={formData.deviceType}
                                onChange={(e) => setFormData((prev) => ({ ...prev, deviceType: e.target.value }))}
                                placeholder="Pacemaker, ICD, CRT-D, etc."
                            />
                            <Input
                                label="Manufacturer"
                                value={formData.manufacturer}
                                onChange={(e) => setFormData((prev) => ({ ...prev, manufacturer: e.target.value }))}
                                placeholder="Device manufacturer"
                            />
                            <Input
                                label="Model"
                                value={formData.model}
                                onChange={(e) => setFormData((prev) => ({ ...prev, model: e.target.value }))}
                                placeholder="Device model"
                            />
                            <Input
                                label="Serial Number"
                                value={formData.serialNumber}
                                onChange={(e) => setFormData((prev) => ({ ...prev, serialNumber: e.target.value }))}
                                placeholder="Device serial number"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Input
                                label="Implant Date"
                                type="datetime-local"
                                value={formData.implantDate}
                                onChange={(e) => setFormData((prev) => ({ ...prev, implantDate: e.target.value }))}
                            />
                            <Input
                                label="Ablation Target"
                                value={formData.ablationTarget}
                                onChange={(e) => setFormData((prev) => ({ ...prev, ablationTarget: e.target.value }))}
                                placeholder="Target for ablation procedure"
                            />
                            <Input
                                label="Fluoroscopy Time (minutes)"
                                value={formData.fluoroscopyTime}
                                onChange={(e) => setFormData((prev) => ({ ...prev, fluoroscopyTime: e.target.value }))}
                            />
                            <Input
                                label="Follow-up Date"
                                type="datetime-local"
                                value={formData.followUpDate}
                                onChange={(e) => setFormData((prev) => ({ ...prev, followUpDate: e.target.value }))}
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Input
                                label="Complications"
                                value={formData.complications}
                                onChange={(e) => setFormData((prev) => ({ ...prev, complications: e.target.value }))}
                                placeholder="Any complications encountered"
                            />
                            <Input
                                label="Outcome"
                                value={formData.outcome}
                                onChange={(e) => setFormData((prev) => ({ ...prev, outcome: e.target.value }))}
                                placeholder="Procedure outcome"
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
                                {isEditMode ? 'Update Study' : 'Create Study'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
