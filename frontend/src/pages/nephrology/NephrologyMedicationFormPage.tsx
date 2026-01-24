import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { nephrologyMedicationService } from '../../services/nephrology-medication.service';
import { providerService } from '../../services/provider.service';
import { patientService } from '../../services/patient.service';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, SearchableSelect } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import type { CreateNephrologyMedicationOrderRequest, NephrologyMedicationRoute } from '../../types';
import type { SelectOption } from '../../components/ui/SearchableSelect';
import { NephrologyNav } from './NephrologyNav';

const routeOptions: NephrologyMedicationRoute[] = ['PO', 'IV', 'IM', 'SC', 'SL', 'OTHER'];

const formatDateTimeLocal = (value: Date) => {
    const local = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
};

type MedicationFormState = {
    patientId: string;
    providerId: string;
    medicationName: string;
    dose: string;
    route: NephrologyMedicationRoute;
    frequency: string;
    startDate: string;
    endDate: string;
    lastAdministeredAt: string;
    isActive: boolean;
    indication: string;
    notes: string;
};

export function NephrologyMedicationFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const isEditMode = Boolean(id);
    const [patientInput, setPatientInput] = useState('');
    const [providerInput, setProviderInput] = useState('');

    const [formData, setFormData] = useState<MedicationFormState>({
        patientId: '',
        providerId: '',
        medicationName: '',
        dose: '',
        route: 'PO',
        frequency: '',
        startDate: '',
        endDate: '',
        lastAdministeredAt: '',
        isActive: true,
        indication: '',
        notes: '',
    });

    const { data: order, isLoading } = useQuery({
        queryKey: ['nephrology-medication', id],
        queryFn: () => nephrologyMedicationService.getOrder(id!),
        enabled: isEditMode,
    });

    const patientSearch = patientInput.trim();
    const providerSearch = providerInput.trim();

    const { data: patientsData, isLoading: isPatientsLoading } = useQuery({
        queryKey: ['patients', 'nephrology-medication', patientSearch],
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
        queryKey: ['providers', 'nephrology-medication', providerSearch],
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
        if (!order) return;
        setFormData({
            patientId: order.patientId,
            providerId: order.providerId || '',
            medicationName: order.medicationName,
            dose: order.dose || '',
            route: order.route || 'PO',
            frequency: order.frequency || '',
            startDate: order.startDate || '',
            endDate: order.endDate || '',
            lastAdministeredAt: order.lastAdministeredAt
                ? formatDateTimeLocal(new Date(order.lastAdministeredAt))
                : '',
            isActive: order.isActive ?? true,
            indication: order.indication || '',
            notes: order.notes || '',
        });
        if (order.patient) {
            setPatientInput(`${order.patient.firstName} ${order.patient.lastName}`);
        } else {
            setPatientInput(order.patientId);
        }
        if (order.provider) {
            const prefix = order.provider.role === 'DOCTOR' ? 'Dr. ' : '';
            setProviderInput(`${prefix}${order.provider.firstName} ${order.provider.lastName}`);
        } else if (order.providerId) {
            setProviderInput(order.providerId);
        }
    }, [order]);

    const createMutation = useMutation({
        mutationFn: (payload: CreateNephrologyMedicationOrderRequest) => nephrologyMedicationService.createOrder(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['nephrology-medications'] });
            navigate('/nephrology/medications');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (payload: CreateNephrologyMedicationOrderRequest) => nephrologyMedicationService.updateOrder(id!, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['nephrology-medications'] });
            queryClient.invalidateQueries({ queryKey: ['nephrology-medication', id] });
            navigate('/nephrology/medications');
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
        if (!formData.medicationName) {
            setError('Medication name is required.');
            return;
        }

        const payload: CreateNephrologyMedicationOrderRequest = {
            patientId: formData.patientId,
            providerId: formData.providerId || undefined,
            medicationName: formData.medicationName,
            dose: formData.dose || undefined,
            route: formData.route || undefined,
            frequency: formData.frequency || undefined,
            startDate: formData.startDate || undefined,
            endDate: formData.endDate || undefined,
            lastAdministeredAt: formData.lastAdministeredAt || undefined,
            isActive: formData.isActive,
            indication: formData.indication || undefined,
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    if (isEditMode && !order) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Medication order not found</p>
                <Link to="/nephrology/medications" className="text-emerald-600 hover:underline mt-2 inline-block">
                    Back to medications
                </Link>
            </div>
        );
    }

    const patients = patientsData?.patients ?? [];
    const patientOptions: SelectOption[] = patients.map((patient) => ({
        id: patient.id,
        label: `${patient.firstName} ${patient.lastName}`,
        subLabel: `MRN ${patient.mrn}${patient.phone ? ` | ${patient.phone}` : ''}`,
    }));

    const providerOptions: SelectOption[] = (providersData?.providers || []).map((provider) => ({
        id: provider.id,
        label: `${provider.role === 'DOCTOR' ? 'Dr. ' : ''}${provider.firstName} ${provider.lastName}`,
        subLabel: provider.role,
    }));

    const isSaving = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6 lg:pl-0">
            <div className="flex items-center gap-4 pt-2 lg:pt-0">
                <Link to="/nephrology/medications">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft size={18} className="mr-2" />
                        Back
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEditMode ? 'Edit Medication Order' : 'New Medication Order'}
                </h1>
            </div>

            <NephrologyNav />

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                        {error}
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Medication Details</CardTitle>
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
                            <Input
                                label="Medication Name *"
                                value={formData.medicationName}
                                onChange={(e) => setFormData((prev) => ({ ...prev, medicationName: e.target.value }))}
                                required
                            />
                            <Input
                                label="Dose"
                                value={formData.dose}
                                onChange={(e) => setFormData((prev) => ({ ...prev, dose: e.target.value }))}
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Route</label>
                                <select
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                                    value={formData.route}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            route: e.target.value as NephrologyMedicationRoute,
                                        }))
                                    }
                                >
                                    {routeOptions.map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                            <Input
                                label="Frequency"
                                value={formData.frequency}
                                onChange={(e) => setFormData((prev) => ({ ...prev, frequency: e.target.value }))}
                            />
                            <Input
                                label="Start Date"
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                            />
                            <Input
                                label="End Date"
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                            />
                            <Input
                                label="Last Administered"
                                type="datetime-local"
                                value={formData.lastAdministeredAt}
                                onChange={(e) => setFormData((prev) => ({ ...prev, lastAdministeredAt: e.target.value }))}
                            />
                            <div className="flex items-center gap-2 mt-6">
                                <input
                                    id="isActive"
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <label htmlFor="isActive" className="text-sm text-gray-700">Active medication</label>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-4">
                            <Input
                                label="Indication"
                                value={formData.indication}
                                onChange={(e) => setFormData((prev) => ({ ...prev, indication: e.target.value }))}
                                placeholder="Reason for medication"
                            />
                            <Input
                                label="Notes"
                                value={formData.notes}
                                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                                placeholder="Additional notes"
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving}>
                        <Save size={18} className="mr-2" />
                        {isEditMode ? 'Update Medication' : 'Create Medication'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
