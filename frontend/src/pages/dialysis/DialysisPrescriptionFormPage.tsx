import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dialysisPrescriptionService } from '../../services/dialysis-prescription.service';
import { patientService } from '../../services/patient.service';
import { providerService } from '../../services/provider.service';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, SearchableSelect } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import type { CreateDialysisPrescriptionRequest } from '../../types';
import type { SelectOption } from '../../components/ui/SearchableSelect';
import { DialysisNav } from './DialysisNav';

type PrescriptionFormState = {
    patientId: string;
    providerId: string;
    dryWeight: string;
    targetUltrafiltration: string;
    durationMinutes: string;
    dialyzer: string;
    dialysate: string;
    bloodFlowRate: string;
    dialysateFlowRate: string;
    accessType: string;
    frequency: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    notes: string;
};

export function DialysisPrescriptionFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const isEditMode = Boolean(id);
    const [patientInput, setPatientInput] = useState('');
    const [providerInput, setProviderInput] = useState('');

    const [formData, setFormData] = useState<PrescriptionFormState>({
        patientId: '',
        providerId: '',
        dryWeight: '',
        targetUltrafiltration: '',
        durationMinutes: '',
        dialyzer: '',
        dialysate: '',
        bloodFlowRate: '',
        dialysateFlowRate: '',
        accessType: '',
        frequency: '',
        startDate: '',
        endDate: '',
        isActive: true,
        notes: '',
    });

    const { data: prescription, isLoading } = useQuery({
        queryKey: ['dialysis-prescription', id],
        queryFn: () => dialysisPrescriptionService.getPrescription(id!),
        enabled: isEditMode,
    });

    const patientSearch = patientInput.trim();
    const providerSearch = providerInput.trim();

    const { data: patientsData, isLoading: isPatientsLoading } = useQuery({
        queryKey: ['patients', 'dialysis-prescription', patientSearch],
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
        queryKey: ['providers', 'dialysis-prescription', providerSearch],
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
        if (!prescription) return;
        setFormData({
            patientId: prescription.patientId,
            providerId: prescription.providerId || '',
            dryWeight: prescription.dryWeight?.toString() || '',
            targetUltrafiltration: prescription.targetUltrafiltration?.toString() || '',
            durationMinutes: prescription.durationMinutes?.toString() || '',
            dialyzer: prescription.dialyzer || '',
            dialysate: prescription.dialysate || '',
            bloodFlowRate: prescription.bloodFlowRate?.toString() || '',
            dialysateFlowRate: prescription.dialysateFlowRate?.toString() || '',
            accessType: prescription.accessType || '',
            frequency: prescription.frequency || '',
            startDate: prescription.startDate || '',
            endDate: prescription.endDate || '',
            isActive: prescription.isActive ?? true,
            notes: prescription.notes || '',
        });
        if (prescription.patient) {
            setPatientInput(`${prescription.patient.firstName} ${prescription.patient.lastName}`);
        } else {
            setPatientInput(prescription.patientId);
        }
        if (prescription.provider) {
            const prefix = prescription.provider.role === 'DOCTOR' ? 'Dr. ' : '';
            setProviderInput(`${prefix}${prescription.provider.firstName} ${prescription.provider.lastName}`);
        } else if (prescription.providerId) {
            setProviderInput(prescription.providerId);
        }
    }, [prescription]);

    const createMutation = useMutation({
        mutationFn: (payload: CreateDialysisPrescriptionRequest) =>
            dialysisPrescriptionService.createPrescription(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dialysis-prescriptions'] });
            navigate('/dialysis/prescriptions');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (payload: CreateDialysisPrescriptionRequest) =>
            dialysisPrescriptionService.updatePrescription(id!, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dialysis-prescriptions'] });
            queryClient.invalidateQueries({ queryKey: ['dialysis-prescription', id] });
            navigate('/dialysis/prescriptions');
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

        const payload: CreateDialysisPrescriptionRequest = {
            patientId: formData.patientId,
            providerId: formData.providerId || undefined,
            dryWeight: toNumber(formData.dryWeight),
            targetUltrafiltration: toNumber(formData.targetUltrafiltration),
            durationMinutes: toNumber(formData.durationMinutes),
            dialyzer: formData.dialyzer || undefined,
            dialysate: formData.dialysate || undefined,
            bloodFlowRate: toNumber(formData.bloodFlowRate),
            dialysateFlowRate: toNumber(formData.dialysateFlowRate),
            accessType: formData.accessType || undefined,
            frequency: formData.frequency || undefined,
            startDate: formData.startDate || undefined,
            endDate: formData.endDate || undefined,
            isActive: formData.isActive,
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

    if (isEditMode && !prescription) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Prescription not found</p>
                <Link to="/dialysis/prescriptions" className="text-blue-600 hover:underline mt-2 inline-block">
                    Back to prescriptions
                </Link>
            </div>
        );
    }

    const patients = patientsData?.patients ?? [];
    const patientOptions: SelectOption[] = patients.map((patient) => ({
        id: patient.id,
        label: `${patient.firstName} ${patient.lastName}`,
        subLabel: `MRN ${patient.mrn}${patient.phone ? ` • ${patient.phone}` : ''}`,
    }));

    const providers = providersData?.providers ?? [];
    const providerOptions: SelectOption[] = providers.map((provider) => {
        const prefix = provider.role === 'DOCTOR' ? 'Dr. ' : '';
        const secondary = [provider.specialty, provider.department].filter(Boolean).join(' • ') || provider.role;
        return {
            id: provider.id,
            label: `${prefix}${provider.firstName} ${provider.lastName}`,
            subLabel: secondary,
        };
    });

    const isSaving = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6 lg:pl-0">
            <div className="flex items-center gap-4 pt-2 lg:pt-0">
                <Link to="/dialysis/prescriptions">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft size={18} className="mr-2" />
                        Back
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEditMode ? 'Edit Prescription' : 'New Prescription'}
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
                        <CardTitle>Core Details</CardTitle>
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
                                    setFormData((prev) => ({ ...prev, patientId: '' }));
                                }}
                                onSelect={(option) => {
                                    setPatientInput(option.label);
                                    setFormData((prev) => ({ ...prev, patientId: option.id }));
                                }}
                            />
                            <SearchableSelect
                                label="Provider"
                                placeholder="Search providers..."
                                value={providerInput}
                                options={providerOptions}
                                selectedId={formData.providerId}
                                isLoading={isProvidersLoading}
                                onInputChange={(value) => {
                                    setProviderInput(value);
                                    setFormData((prev) => ({ ...prev, providerId: '' }));
                                }}
                                onSelect={(option) => {
                                    setProviderInput(option.label);
                                    setFormData((prev) => ({ ...prev, providerId: option.id }));
                                }}
                            />
                            <Input
                                label="Access Type"
                                name="accessType"
                                value={formData.accessType}
                                onChange={(e) => setFormData((prev) => ({ ...prev, accessType: e.target.value }))}
                            />
                            <Input
                                label="Frequency"
                                name="frequency"
                                value={formData.frequency}
                                onChange={(e) => setFormData((prev) => ({ ...prev, frequency: e.target.value }))}
                                placeholder="e.g., 3x/week"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Prescription Targets</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="Dry Weight"
                                type="number"
                                step="0.1"
                                name="dryWeight"
                                value={formData.dryWeight}
                                onChange={(e) => setFormData((prev) => ({ ...prev, dryWeight: e.target.value }))}
                            />
                            <Input
                                label="Target UF"
                                type="number"
                                step="0.1"
                                name="targetUltrafiltration"
                                value={formData.targetUltrafiltration}
                                onChange={(e) => setFormData((prev) => ({ ...prev, targetUltrafiltration: e.target.value }))}
                            />
                            <Input
                                label="Duration (min)"
                                type="number"
                                step="1"
                                name="durationMinutes"
                                value={formData.durationMinutes}
                                onChange={(e) => setFormData((prev) => ({ ...prev, durationMinutes: e.target.value }))}
                            />
                            <Input
                                label="Blood Flow Rate"
                                type="number"
                                step="1"
                                name="bloodFlowRate"
                                value={formData.bloodFlowRate}
                                onChange={(e) => setFormData((prev) => ({ ...prev, bloodFlowRate: e.target.value }))}
                            />
                            <Input
                                label="Dialysate Flow Rate"
                                type="number"
                                step="1"
                                name="dialysateFlowRate"
                                value={formData.dialysateFlowRate}
                                onChange={(e) => setFormData((prev) => ({ ...prev, dialysateFlowRate: e.target.value }))}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Dialyzer & Bath</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Dialyzer"
                                name="dialyzer"
                                value={formData.dialyzer}
                                onChange={(e) => setFormData((prev) => ({ ...prev, dialyzer: e.target.value }))}
                            />
                            <Input
                                label="Dialysate"
                                name="dialysate"
                                value={formData.dialysate}
                                onChange={(e) => setFormData((prev) => ({ ...prev, dialysate: e.target.value }))}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Dates & Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Start Date"
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                            />
                            <Input
                                label="End Date"
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                            />
                        </div>
                        <label className="mt-4 flex items-center gap-2 text-sm text-gray-700">
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            Active prescription
                        </label>
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
                            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" size="lg" isLoading={isSaving}>
                        <Save size={18} className="mr-2" />
                        {isEditMode ? 'Update Prescription' : 'Save Prescription'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
