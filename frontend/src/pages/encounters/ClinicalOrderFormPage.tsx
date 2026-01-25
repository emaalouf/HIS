import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clinicalOrderService } from '../../services/clinical-order.service';
import { encounterService } from '../../services/encounter.service';
import { providerService } from '../../services/provider.service';
import { patientService } from '../../services/patient.service';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, SearchableSelect } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import type {
    CreateClinicalOrderRequest,
    OrderPriority,
    OrderStatus,
    OrderType,
} from '../../types';
import type { SelectOption } from '../../components/ui/SearchableSelect';
import { formatDateTime } from '../../lib/utils';
import { ClinicalNav } from './ClinicalNav';

const statusOptions: OrderStatus[] = [
    'ORDERED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
];

const typeOptions: OrderType[] = [
    'LAB',
    'IMAGING',
    'MEDICATION',
    'PROCEDURE',
    'OTHER',
];

const priorityOptions: OrderPriority[] = [
    'ROUTINE',
    'URGENT',
    'STAT',
];

const formatDateTimeLocal = (value: Date) => {
    const local = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
};

type ClinicalOrderFormState = {
    patientId: string;
    providerId: string;
    encounterId: string;
    orderType: OrderType;
    status: OrderStatus;
    priority: OrderPriority;
    orderedAt: string;
    orderName: string;
    description: string;
    notes: string;
};

export function ClinicalOrderFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const isEditMode = Boolean(id);
    const [patientInput, setPatientInput] = useState('');
    const [providerInput, setProviderInput] = useState('');
    const [encounterInput, setEncounterInput] = useState('');

    const defaultOrderedAt = useMemo(() => formatDateTimeLocal(new Date()), []);

    const [formData, setFormData] = useState<ClinicalOrderFormState>({
        patientId: '',
        providerId: '',
        encounterId: '',
        orderType: 'LAB',
        status: 'ORDERED',
        priority: 'ROUTINE',
        orderedAt: defaultOrderedAt,
        orderName: '',
        description: '',
        notes: '',
    });

    const { data: order, isLoading } = useQuery({
        queryKey: ['clinical-order', id],
        queryFn: () => clinicalOrderService.getOrder(id!),
        enabled: isEditMode,
    });

    const patientSearch = patientInput.trim();
    const providerSearch = providerInput.trim();
    const encounterSearch = encounterInput.trim();

    const { data: patientsData, isLoading: isPatientsLoading } = useQuery({
        queryKey: ['patients', 'clinical-order-picker', patientSearch],
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
        queryKey: ['providers', 'clinical-order-picker', providerSearch],
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
        queryKey: ['encounters', 'clinical-order-picker', encounterSearch],
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
            providerId: order.providerId,
            encounterId: order.encounterId || '',
            orderType: order.orderType,
            status: order.status,
            priority: order.priority,
            orderedAt: formatDateTimeLocal(new Date(order.orderedAt)),
            orderName: order.orderName,
            description: order.description || '',
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
        } else {
            setProviderInput(order.providerId);
        }
        if (order.encounter) {
            setEncounterInput(`${formatDateTime(order.encounter.startTime)} · ${order.encounter.id}`);
        } else if (order.encounterId) {
            setEncounterInput(order.encounterId);
        }
    }, [order]);

    const createMutation = useMutation({
        mutationFn: (payload: CreateClinicalOrderRequest) => clinicalOrderService.createOrder(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clinical-orders'] });
            navigate('/clinical-orders');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (payload: CreateClinicalOrderRequest) => clinicalOrderService.updateOrder(id!, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clinical-orders'] });
            queryClient.invalidateQueries({ queryKey: ['clinical-order', id] });
            navigate('/clinical-orders');
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
        if (!formData.providerId) {
            setError('Please select a provider.');
            return;
        }
        if (!formData.orderName.trim()) {
            setError('Please provide an order name.');
            return;
        }

        const payload: CreateClinicalOrderRequest = {
            patientId: formData.patientId,
            providerId: formData.providerId,
            encounterId: formData.encounterId || undefined,
            orderType: formData.orderType,
            status: formData.status,
            priority: formData.priority,
            orderedAt: formData.orderedAt || undefined,
            orderName: formData.orderName.trim(),
            description: formData.description || undefined,
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
                <p className="text-gray-500">Order not found</p>
                <Link to="/clinical-orders" className="text-blue-600 hover:underline mt-2 inline-block">
                    Back to orders
                </Link>
            </div>
        );
    }

    const isSaving = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6 lg:pl-0">
            <div className="flex items-center gap-4 pt-2 lg:pt-0">
                <Link to="/clinical-orders">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft size={18} className="mr-2" />
                        Back
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEditMode ? 'Edit Clinical Order' : 'New Clinical Order'}
                </h1>
            </div>

            <ClinicalNav />

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
                                label="Ordering Provider"
                                value={providerInput}
                                required
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Order Type</label>
                                <select
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                                    value={formData.orderType}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, orderType: e.target.value as OrderType }))
                                    }
                                >
                                    {typeOptions.map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                                    value={formData.status}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, status: e.target.value as OrderStatus }))
                                    }
                                >
                                    {statusOptions.map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                <select
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                                    value={formData.priority}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, priority: e.target.value as OrderPriority }))
                                    }
                                >
                                    {priorityOptions.map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Ordered At"
                                type="datetime-local"
                                value={formData.orderedAt}
                                onChange={(e) => setFormData((prev) => ({ ...prev, orderedAt: e.target.value }))}
                            />
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
                        </div>
                        <Input
                            label="Order Name"
                            value={formData.orderName}
                            onChange={(e) => setFormData((prev) => ({ ...prev, orderName: e.target.value }))}
                            placeholder="e.g., CMP, CT Head"
                            required
                        />
                        <Input
                            label="Description"
                            value={formData.description}
                            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                            placeholder="Optional clinical details"
                        />
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
                        {isEditMode ? 'Update Order' : 'Save Order'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
