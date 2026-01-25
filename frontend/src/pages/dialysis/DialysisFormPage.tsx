import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dialysisService } from '../../services/dialysis.service';
import { providerService } from '../../services/provider.service';
import { patientService } from '../../services/patient.service';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, SearchableSelect } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import type { CreateDialysisSessionRequest, DialysisStatus } from '../../types';
import type { SelectOption } from '../../components/ui/SearchableSelect';
import { DialysisNav } from './DialysisNav';

const statusOptions: DialysisStatus[] = [
    'SCHEDULED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
];

const formatDateTimeLocal = (value: Date) => {
    const local = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
};

type DialysisFormState = {
    patientId: string;
    providerId: string;
    startTime: string;
    endTime: string;
    status: DialysisStatus;
    machineNumber: string;
    accessType: string;
    dialyzer: string;
    dialysate: string;
    bloodFlowRate: string;
    dialysateFlowRate: string;
    ultrafiltrationVolume: string;
    weightPre: string;
    weightPost: string;
    notes: string;
};

export function DialysisFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const isEditMode = Boolean(id);
    const [patientInput, setPatientInput] = useState('');
    const [providerInput, setProviderInput] = useState('');

    const defaultStart = useMemo(() => {
        const start = new Date();
        start.setMinutes(start.getMinutes() + 30);
        return formatDateTimeLocal(start);
    }, []);

    const defaultEnd = useMemo(() => {
        const end = new Date();
        end.setMinutes(end.getMinutes() + 270);
        return formatDateTimeLocal(end);
    }, []);

    const [formData, setFormData] = useState<DialysisFormState>({
        patientId: '',
        providerId: '',
        startTime: defaultStart,
        endTime: defaultEnd,
        status: 'SCHEDULED',
        machineNumber: '',
        accessType: '',
        dialyzer: '',
        dialysate: '',
        bloodFlowRate: '',
        dialysateFlowRate: '',
        ultrafiltrationVolume: '',
        weightPre: '',
        weightPost: '',
        notes: '',
    });

    const { data: session, isLoading } = useQuery({
        queryKey: ['dialysis-session', id],
        queryFn: () => dialysisService.getSession(id!),
        enabled: isEditMode,
    });

    const patientSearch = patientInput.trim();
    const providerSearch = providerInput.trim();

    const { data: patientsData, isLoading: isPatientsLoading } = useQuery({
        queryKey: ['patients', 'dialysis-picker', patientSearch],
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
        queryKey: ['providers', 'dialysis-picker', providerSearch],
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
        if (!session) return;
        setFormData({
            patientId: session.patientId,
            providerId: session.providerId,
            startTime: formatDateTimeLocal(new Date(session.startTime)),
            endTime: formatDateTimeLocal(new Date(session.endTime)),
            status: session.status,
            machineNumber: session.machineNumber || '',
            accessType: session.accessType || '',
            dialyzer: session.dialyzer || '',
            dialysate: session.dialysate || '',
            bloodFlowRate: session.bloodFlowRate?.toString() || '',
            dialysateFlowRate: session.dialysateFlowRate?.toString() || '',
            ultrafiltrationVolume: session.ultrafiltrationVolume?.toString() || '',
            weightPre: session.weightPre?.toString() || '',
            weightPost: session.weightPost?.toString() || '',
            notes: session.notes || '',
        });
        if (session.patient) {
            setPatientInput(`${session.patient.firstName} ${session.patient.lastName}`);
        } else {
            setPatientInput(session.patientId);
        }
        if (session.provider) {
            const prefix = session.provider.role === 'DOCTOR' ? 'Dr. ' : '';
            setProviderInput(`${prefix}${session.provider.firstName} ${session.provider.lastName}`);
        } else {
            setProviderInput(session.providerId);
        }
    }, [session]);

    const createMutation = useMutation({
        mutationFn: (payload: CreateDialysisSessionRequest) => dialysisService.createSession(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dialysis-sessions'] });
            navigate('/dialysis');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (payload: CreateDialysisSessionRequest) => dialysisService.updateSession(id!, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dialysis-sessions'] });
            queryClient.invalidateQueries({ queryKey: ['dialysis-session', id] });
            navigate('/dialysis');
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
        if (!formData.providerId) {
            setError('Please select a provider.');
            return;
        }

        const payload: CreateDialysisSessionRequest = {
            patientId: formData.patientId,
            providerId: formData.providerId,
            status: formData.status,
            startTime: formData.startTime,
            endTime: formData.endTime,
            machineNumber: formData.machineNumber || undefined,
            accessType: formData.accessType || undefined,
            dialyzer: formData.dialyzer || undefined,
            dialysate: formData.dialysate || undefined,
            bloodFlowRate: toNumber(formData.bloodFlowRate),
            dialysateFlowRate: toNumber(formData.dialysateFlowRate),
            ultrafiltrationVolume: toNumber(formData.ultrafiltrationVolume),
            weightPre: toNumber(formData.weightPre),
            weightPost: toNumber(formData.weightPost),
            notes: formData.notes || undefined,
        };

        if (isEditMode) {
            updateMutation.mutate(payload);
        } else {
            createMutation.mutate(payload);
        }
    };

    if (isEditMode && isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (isEditMode && !session) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Dialysis session not found</p>
                <Link to="/dialysis" className="text-blue-600 hover:underline mt-2 inline-block">
                    Back to dialysis
                </Link>
            </div>
        );
    }

    const isSaving = createMutation.isPending || updateMutation.isPending;
    const patients = patientsData?.patients ?? [];
    const patientOptions: SelectOption[] = patients.map((patient) => ({
        id: patient.id,
        label: `${patient.firstName} ${patient.lastName}`,
        subLabel: `MRN ${patient.mrn}${patient.phone ? ` • ${patient.phone}` : ''}`,
    }));

    const providers = providersData?.providers ?? [];
    const providerOptions: SelectOption[] = providers.map((provider) => {
        const prefix = provider.role === 'DOCTOR' ? 'Dr. ' : '';
        const departmentLabel = provider.department?.name || provider.departmentId;
        const secondary = [provider.specialty, departmentLabel].filter(Boolean).join(' • ') || provider.role;
        return {
            id: provider.id,
            label: `${prefix}${provider.firstName} ${provider.lastName}`,
            subLabel: secondary,
        };
    });

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6 lg:pl-0">
            <div className="flex items-center gap-4 pt-2 lg:pt-0">
                <Link to="/dialysis">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft size={18} className="mr-2" />
                        Back
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEditMode ? 'Edit Dialysis Session' : 'New Dialysis Session'}
                </h1>
            </div>

            <DialysisNav />

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                        {error}
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Session Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SearchableSelect
                                label="Patient *"
                                placeholder="Search patients..."
                                value={patientInput}
                                required
                                options={patientOptions}
                                selectedId={formData.patientId}
                                isLoading={isPatientsLoading}
                                onInputChange={(value) => {
                                    setPatientInput(value);
                                    setFormData(prev => ({ ...prev, patientId: '' }));
                                }}
                                onSelect={(option) => {
                                    setPatientInput(option.label);
                                    setFormData(prev => ({ ...prev, patientId: option.id }));
                                }}
                            />
                            <SearchableSelect
                                label="Provider *"
                                placeholder="Search providers..."
                                value={providerInput}
                                required
                                options={providerOptions}
                                selectedId={formData.providerId}
                                isLoading={isProvidersLoading}
                                onInputChange={(value) => {
                                    setProviderInput(value);
                                    setFormData(prev => ({ ...prev, providerId: '' }));
                                }}
                                onSelect={(option) => {
                                    setProviderInput(option.label);
                                    setFormData(prev => ({ ...prev, providerId: option.id }));
                                }}
                            />
                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as DialysisStatus }))}
                                    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    {statusOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <Input
                                label="Start Time *"
                                type="datetime-local"
                                name="startTime"
                                value={formData.startTime}
                                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                                required
                            />
                            <Input
                                label="End Time *"
                                type="datetime-local"
                                name="endTime"
                                value={formData.endTime}
                                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                                required
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Treatment Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Machine Number"
                                name="machineNumber"
                                value={formData.machineNumber}
                                onChange={(e) => setFormData(prev => ({ ...prev, machineNumber: e.target.value }))}
                            />
                            <Input
                                label="Access Type"
                                name="accessType"
                                value={formData.accessType}
                                onChange={(e) => setFormData(prev => ({ ...prev, accessType: e.target.value }))}
                                placeholder="e.g., AV fistula"
                            />
                            <Input
                                label="Dialyzer"
                                name="dialyzer"
                                value={formData.dialyzer}
                                onChange={(e) => setFormData(prev => ({ ...prev, dialyzer: e.target.value }))}
                            />
                            <Input
                                label="Dialysate"
                                name="dialysate"
                                value={formData.dialysate}
                                onChange={(e) => setFormData(prev => ({ ...prev, dialysate: e.target.value }))}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Flow and Fluid Targets</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="Blood Flow Rate"
                                name="bloodFlowRate"
                                type="number"
                                step="1"
                                value={formData.bloodFlowRate}
                                onChange={(e) => setFormData(prev => ({ ...prev, bloodFlowRate: e.target.value }))}
                            />
                            <Input
                                label="Dialysate Flow Rate"
                                name="dialysateFlowRate"
                                type="number"
                                step="1"
                                value={formData.dialysateFlowRate}
                                onChange={(e) => setFormData(prev => ({ ...prev, dialysateFlowRate: e.target.value }))}
                            />
                            <Input
                                label="Ultrafiltration Volume"
                                name="ultrafiltrationVolume"
                                type="number"
                                step="1"
                                value={formData.ultrafiltrationVolume}
                                onChange={(e) => setFormData(prev => ({ ...prev, ultrafiltrationVolume: e.target.value }))}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Weights</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Pre-weight"
                                name="weightPre"
                                type="number"
                                step="0.1"
                                value={formData.weightPre}
                                onChange={(e) => setFormData(prev => ({ ...prev, weightPre: e.target.value }))}
                            />
                            <Input
                                label="Post-weight"
                                name="weightPost"
                                type="number"
                                step="0.1"
                                value={formData.weightPost}
                                onChange={(e) => setFormData(prev => ({ ...prev, weightPost: e.target.value }))}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <textarea
                            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                            rows={3}
                            placeholder="Optional notes"
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" size="lg" isLoading={isSaving}>
                        <Save size={18} className="mr-2" />
                        {isEditMode ? 'Update Session' : 'Save Session'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
