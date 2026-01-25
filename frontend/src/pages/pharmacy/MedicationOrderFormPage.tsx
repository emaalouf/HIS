import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { medicationOrderService } from '../../services/medication-order.service';
import { encounterService } from '../../services/encounter.service';
import { providerService } from '../../services/provider.service';
import { patientService } from '../../services/patient.service';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, SearchableSelect } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import type {
    CreateMedicationOrderRequest,
    MedicationOrderStatus,
    MedicationRoute,
} from '../../types';
import type { SelectOption } from '../../components/ui/SearchableSelect';
import { formatDateTime } from '../../lib/utils';
import { PharmacyNav } from './PharmacyNav';

const statusOptions: MedicationOrderStatus[] = [
    'ACTIVE',
    'ON_HOLD',
    'COMPLETED',
    'DISCONTINUED',
];

const routeOptions: MedicationRoute[] = [
    'IV',
    'PO',
    'IM',
    'SC',
    'SL',
    'INHALATION',
    'TOPICAL',
    'OTHER',
];

const formatDateTimeLocal = (value: Date) => {
    const local = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
};

type MedicationOrderFormState = {
    patientId: string;
    providerId: string;
    encounterId: string;
    status: MedicationOrderStatus;
    medicationName: string;
    dose: string;
    route: MedicationRoute | '';
    frequency: string;
    startDate: string;
    endDate: string;
    lastAdministeredAt: string;
    indication: string;
    notes: string;
};

export function MedicationOrderFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const isEditMode = Boolean(id);
    const [patientInput, setPatientInput] = useState('');
    const [providerInput, setProviderInput] = useState('');
    const [encounterInput, setEncounterInput] = useState('');

    const defaultStartDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

    const [formData, setFormData] = useState<MedicationOrderFormState>({
        patientId: '',
        providerId: '',
        encounterId: '',
        status: 'ACTIVE',
        medicationName: '',
        dose: '',
        route: '',
        frequency: '',
        startDate: defaultStartDate,
        endDate: '',
        lastAdministeredAt: '',
        indication: '',
        notes: '',
    });

    const { data: order, isLoading } = useQuery({
        queryKey: ['medication-order', id],
        queryFn: () => medicationOrderService.getOrder(id!),
        enabled: isEditMode,
    });

    const patientSearch = patientInput.trim();
    const providerSearch = providerInput.trim();
    const encounterSearch = encounterInput.trim();

    const { data: patientsData, isLoading: isPatientsLoading } = useQuery({
        queryKey: ['patients', 'medication-order-picker', patientSearch],
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
        queryKey: ['providers', 'medication-order-picker', providerSearch],
        queryFn: () =>
            providerService.getProviders({
                page: 1,
                limit: 10,
                search: providerSearch || undefined,
                sortBy: providerSearch ? undefined : 'createdAt',
                sortOrder: providerSearch ? undefined : 'desc',
            }),
    });

    const { data: encountersData, isLoading: isEncountersLoading } = useQuery({
        queryKey: ['encounters', 'medication-order-picker', encounterSearch],
        queryFn: () =>
            encounterService.getEncounters({
                page: 1,
                limit: 10,
                search: encounterSearch || undefined,
            }),
    });

    useEffect(() => {
        if (!order) return;
        setFormData({
            patientId: order.patientId,
            providerId: order.providerId || '',
            encounterId: order.encounterId || '',
            status: order.status,
            medicationName: order.medicationName,
            dose: order.dose || '',
            route: order.route || '',
            frequency: order.frequency || '',
            startDate: order.startDate ? order.startDate.slice(0, 10) : '',
            endDate: order.endDate ? order.endDate.slice(0, 10) : '',
            lastAdministeredAt: order.lastAdministeredAt
                ? formatDateTimeLocal(new Date(order.lastAdministeredAt))
                : '',
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
        if (order.encounter) {
            setEncounterInput(`${formatDateTime(order.encounter.startTime)} · ${order.encounter.id}`);
        } else if (order.encounterId) {
            setEncounterInput(order.encounterId);
        }
    }, [order]);

    const createMutation = useMutation({
        mutationFn: (payload: CreateMedicationOrderRequest) => medicationOrderService.createOrder(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['medication-orders'] });
            navigate('/pharmacy');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (payload: CreateMedicationOrderRequest) => medicationOrderService.updateOrder(id!, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['medication-orders'] });
            queryClient.invalidateQueries({ queryKey: ['medication-order', id] });
            navigate('/pharmacy');
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
        if (!formData.medicationName.trim()) {
            setError('Please enter a medication name.');
            return;
        }

        const payload: CreateMedicationOrderRequest = {
            patientId: formData.patientId,
            providerId: formData.providerId || undefined,
            encounterId: formData.encounterId || undefined,
            status: formData.status,
            medicationName: formData.medicationName.trim(),
            dose: formData.dose || undefined,
            route: formData.route || undefined,
            frequency: formData.frequency || undefined,
            startDate: formData.startDate || undefined,
            endDate: formData.endDate || undefined,
            lastAdministeredAt: formData.lastAdministeredAt || undefined,
            indication: formData.indication || undefined,
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

    const encounterOptions: SelectOption[] = (encountersData?.encounters || []).map((encounter) => ({
        id: encounter.id,
        label: encounter.patient
            ? `${encounter.patient.firstName} ${encounter.patient.lastName}`
            : encounter.patientId,
        subLabel: `${formatDateTime(encounter.startTime)} · ${encounter.status}`,
    }));

    if (isEditMode && isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (isEditMode && !order) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Medication order not found</p>
                <Link to="/pharmacy" className="text-blue-600 hover:underline mt-2 inline-block">
                    Back to orders
                </Link>
            </div>
        );
    }

    const isSaving = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6 lg:pl-0">
            <div className="flex items-center gap-4 pt-2 lg:pt-0">
                <Link to="/pharmacy">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft size={18} className="mr-2" />
                        Back
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEditMode ? 'Edit Medication Order' : 'New Medication Order'}
                </h1>
            </div>

            <PharmacyNav />

            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                        <p className="text-red-700 text-sm">{error}</p>
                    </CardContent>
                </Card>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Order Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SearchableSelect
                                label="Patient"
                                value={patientInput}
                                required
                                options={patientOptions}
                                selectedId={formData.patientId}
                                isLoading={isPatientsLoading}
                                placeholder="Search patients"
                                onInputChange={setPatientInput}
                                onSelect={(option) => {
                                    setFormData((prev) => ({ ...prev, patientId: option.id }));
                                    setPatientInput(option.label);
                                }}
                            />
                            <SearchableSelect
                                label="Prescribing Provider"
                                value={providerInput}
                                options={providerOptions}
                                selectedId={formData.providerId}
                                isLoading={isProvidersLoading}
                                placeholder="Search providers"
                                onInputChange={setProviderInput}
                                onSelect={(option) => {
                                    setFormData((prev) => ({ ...prev, providerId: option.id }));
                                    setProviderInput(option.label);
                                }}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                                    value={formData.status}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, status: e.target.value as MedicationOrderStatus }))
                                    }
                                >
                                    {statusOptions.map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
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
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Medication Name"
                                value={formData.medicationName}
                                onChange={(e) => setFormData((prev) => ({ ...prev, medicationName: e.target.value }))}
                                placeholder="e.g., Levetiracetam"
                                required
                            />
                            <Input
                                label="Dose"
                                value={formData.dose}
                                onChange={(e) => setFormData((prev) => ({ ...prev, dose: e.target.value }))}
                                placeholder="e.g., 500 mg"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Route</label>
                                <select
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                                    value={formData.route}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, route: e.target.value as MedicationRoute | '' }))
                                    }
                                >
                                    <option value="">Select route</option>
                                    {routeOptions.map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                            <Input
                                label="Frequency"
                                value={formData.frequency}
                                onChange={(e) => setFormData((prev) => ({ ...prev, frequency: e.target.value }))}
                                placeholder="e.g., BID"
                            />
                            <Input
                                label="Last Administered"
                                type="datetime-local"
                                value={formData.lastAdministeredAt}
                                onChange={(e) => setFormData((prev) => ({ ...prev, lastAdministeredAt: e.target.value }))}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SearchableSelect
                                label="Encounter (optional)"
                                value={encounterInput}
                                options={encounterOptions}
                                selectedId={formData.encounterId}
                                isLoading={isEncountersLoading}
                                placeholder="Search encounters"
                                onInputChange={setEncounterInput}
                                onSelect={(option) => {
                                    setFormData((prev) => ({ ...prev, encounterId: option.id }));
                                    setEncounterInput(option.label);
                                }}
                            />
                            <Input
                                label="Indication"
                                value={formData.indication}
                                onChange={(e) => setFormData((prev) => ({ ...prev, indication: e.target.value }))}
                                placeholder="Optional indication"
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
                            rows={4}
                            placeholder="Optional notes"
                            value={formData.notes}
                            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" size="lg" isLoading={isSaving}>
                        <Save size={18} className="mr-2" />
                        {isEditMode ? 'Update Medication' : 'Save Medication'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
