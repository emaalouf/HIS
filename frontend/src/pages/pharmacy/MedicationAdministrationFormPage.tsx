import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { medicationAdministrationService } from '../../services/medication-administration.service';
import { medicationOrderService } from '../../services/medication-order.service';
import { providerService } from '../../services/provider.service';
import { patientService } from '../../services/patient.service';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, SearchableSelect } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import type {
    CreateMedicationAdministrationRequest,
    MedicationAdministrationStatus,
} from '../../types';
import type { SelectOption } from '../../components/ui/SearchableSelect';
import { PharmacyNav } from './PharmacyNav';

const statusOptions: MedicationAdministrationStatus[] = [
    'GIVEN',
    'HELD',
    'REFUSED',
    'MISSED',
];

const formatDateTimeLocal = (value: Date) => {
    const local = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
};

type MedicationAdministrationFormState = {
    medicationOrderId: string;
    patientId: string;
    administeredById: string;
    administeredAt: string;
    doseGiven: string;
    status: MedicationAdministrationStatus;
    notes: string;
};

export function MedicationAdministrationFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const isEditMode = Boolean(id);
    const [patientInput, setPatientInput] = useState('');
    const [orderInput, setOrderInput] = useState('');
    const [adminInput, setAdminInput] = useState('');

    const defaultAdministeredAt = useMemo(() => formatDateTimeLocal(new Date()), []);

    const [formData, setFormData] = useState<MedicationAdministrationFormState>({
        medicationOrderId: '',
        patientId: '',
        administeredById: '',
        administeredAt: defaultAdministeredAt,
        doseGiven: '',
        status: 'GIVEN',
        notes: '',
    });

    const { data: administration, isLoading } = useQuery({
        queryKey: ['medication-administration', id],
        queryFn: () => medicationAdministrationService.getAdministration(id!),
        enabled: isEditMode,
    });

    const patientSearch = patientInput.trim();
    const orderSearch = orderInput.trim();
    const adminSearch = adminInput.trim();

    const { data: patientsData, isLoading: isPatientsLoading } = useQuery({
        queryKey: ['patients', 'medication-admin-picker', patientSearch],
        queryFn: () =>
            patientService.getPatients({
                page: 1,
                limit: 10,
                search: patientSearch || undefined,
                sortBy: patientSearch ? undefined : 'createdAt',
                sortOrder: patientSearch ? undefined : 'desc',
            }),
    });

    const { data: ordersData, isLoading: isOrdersLoading } = useQuery({
        queryKey: ['medication-orders', 'medication-admin-picker', orderSearch],
        queryFn: () =>
            medicationOrderService.getOrders({
                page: 1,
                limit: 10,
                search: orderSearch || undefined,
            }),
    });

    const { data: providersData, isLoading: isProvidersLoading } = useQuery({
        queryKey: ['providers', 'medication-admin-picker', adminSearch],
        queryFn: () =>
            providerService.getProviders({
                page: 1,
                limit: 10,
                search: adminSearch || undefined,
                sortBy: adminSearch ? undefined : 'createdAt',
                sortOrder: adminSearch ? undefined : 'desc',
            }),
    });

    useEffect(() => {
        if (!administration) return;
        setFormData({
            medicationOrderId: administration.medicationOrderId,
            patientId: administration.patientId,
            administeredById: administration.administeredById || '',
            administeredAt: formatDateTimeLocal(new Date(administration.administeredAt)),
            doseGiven: administration.doseGiven || '',
            status: administration.status,
            notes: administration.notes || '',
        });
        if (administration.patient) {
            setPatientInput(`${administration.patient.firstName} ${administration.patient.lastName}`);
        } else {
            setPatientInput(administration.patientId);
        }
        if (administration.medicationOrder) {
            setOrderInput(administration.medicationOrder.medicationName);
        } else {
            setOrderInput(administration.medicationOrderId);
        }
        if (administration.administeredBy) {
            const prefix = administration.administeredBy.role === 'DOCTOR' ? 'Dr. ' : '';
            setAdminInput(`${prefix}${administration.administeredBy.firstName} ${administration.administeredBy.lastName}`);
        } else if (administration.administeredById) {
            setAdminInput(administration.administeredById);
        }
    }, [administration]);

    const createMutation = useMutation({
        mutationFn: (payload: CreateMedicationAdministrationRequest) =>
            medicationAdministrationService.createAdministration(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['medication-administrations'] });
            navigate('/pharmacy/administrations');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (payload: CreateMedicationAdministrationRequest) =>
            medicationAdministrationService.updateAdministration(id!, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['medication-administrations'] });
            queryClient.invalidateQueries({ queryKey: ['medication-administration', id] });
            navigate('/pharmacy/administrations');
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
        if (!formData.medicationOrderId) {
            setError('Please select a medication order.');
            return;
        }

        const payload: CreateMedicationAdministrationRequest = {
            medicationOrderId: formData.medicationOrderId,
            patientId: formData.patientId,
            administeredById: formData.administeredById || undefined,
            administeredAt: formData.administeredAt || undefined,
            doseGiven: formData.doseGiven || undefined,
            status: formData.status,
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

    const orders = ordersData?.orders ?? [];
    const ordersById = new Map(orders.map((order) => [order.id, order]));
    const orderOptions: SelectOption[] = orders.map((order) => ({
        id: order.id,
        label: order.medicationName,
        subLabel: order.patient
            ? `${order.patient.firstName} ${order.patient.lastName}`
            : order.patientId,
    }));

    const providerOptions: SelectOption[] = (providersData?.providers || []).map((provider) => ({
        id: provider.id,
        label: `${provider.role === 'DOCTOR' ? 'Dr. ' : ''}${provider.firstName} ${provider.lastName}`,
        subLabel: provider.role,
    }));

    if (isEditMode && isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (isEditMode && !administration) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Administration record not found</p>
                <Link to="/pharmacy/administrations" className="text-blue-600 hover:underline mt-2 inline-block">
                    Back to administrations
                </Link>
            </div>
        );
    }

    const isSaving = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6 lg:pl-0">
            <div className="flex items-center gap-4 pt-2 lg:pt-0">
                <Link to="/pharmacy/administrations">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft size={18} className="mr-2" />
                        Back
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEditMode ? 'Edit Administration' : 'New Administration'}
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
                        <CardTitle>Administration Details</CardTitle>
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
                                label="Medication Order"
                                value={orderInput}
                                required
                                options={orderOptions}
                                selectedId={formData.medicationOrderId}
                                isLoading={isOrdersLoading}
                                placeholder="Search orders"
                                onInputChange={setOrderInput}
                                onSelect={(option) => {
                                    const selectedOrder = ordersById.get(option.id);
                                    setFormData((prev) => ({
                                        ...prev,
                                        medicationOrderId: option.id,
                                        patientId: selectedOrder?.patientId || prev.patientId,
                                    }));
                                    setOrderInput(option.label);
                                    if (selectedOrder?.patient) {
                                        setPatientInput(`${selectedOrder.patient.firstName} ${selectedOrder.patient.lastName}`);
                                    }
                                }}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="Administered At"
                                type="datetime-local"
                                value={formData.administeredAt}
                                onChange={(e) => setFormData((prev) => ({ ...prev, administeredAt: e.target.value }))}
                            />
                            <Input
                                label="Dose Given"
                                value={formData.doseGiven}
                                onChange={(e) => setFormData((prev) => ({ ...prev, doseGiven: e.target.value }))}
                                placeholder="e.g., 500 mg"
                            />
                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                                    value={formData.status}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, status: e.target.value as MedicationAdministrationStatus }))
                                    }
                                >
                                    {statusOptions.map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <SearchableSelect
                            label="Administered By"
                            value={adminInput}
                            options={providerOptions}
                            selectedId={formData.administeredById}
                            isLoading={isProvidersLoading}
                            placeholder="Search staff"
                            onInputChange={setAdminInput}
                            onSelect={(option) => {
                                setFormData((prev) => ({ ...prev, administeredById: option.id }));
                                setAdminInput(option.label);
                            }}
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
                        {isEditMode ? 'Update Administration' : 'Save Administration'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
