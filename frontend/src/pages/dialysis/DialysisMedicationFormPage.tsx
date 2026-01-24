import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dialysisMedicationService } from '../../services/dialysis-medication.service';
import { patientService } from '../../services/patient.service';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, SearchableSelect } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import type { CreateDialysisMedicationOrderRequest, DialysisMedicationRoute } from '../../types';
import type { SelectOption } from '../../components/ui/SearchableSelect';
import { DialysisNav } from './DialysisNav';

const routeOptions: DialysisMedicationRoute[] = ['IV', 'PO', 'IM', 'SC', 'OTHER'];

const formatDateTimeLocal = (value: Date) => {
    const local = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
};

type MedicationFormState = {
    patientId: string;
    medicationName: string;
    dose: string;
    route: DialysisMedicationRoute;
    frequency: string;
    startDate: string;
    endDate: string;
    lastAdministeredAt: string;
    isActive: boolean;
    notes: string;
};

export function DialysisMedicationFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const isEditMode = Boolean(id);
    const [patientInput, setPatientInput] = useState('');

    const [formData, setFormData] = useState<MedicationFormState>({
        patientId: '',
        medicationName: '',
        dose: '',
        route: 'IV',
        frequency: '',
        startDate: '',
        endDate: '',
        lastAdministeredAt: '',
        isActive: true,
        notes: '',
    });

    const { data: order, isLoading } = useQuery({
        queryKey: ['dialysis-medication', id],
        queryFn: () => dialysisMedicationService.getOrder(id!),
        enabled: isEditMode,
    });

    const patientSearch = patientInput.trim();

    const { data: patientsData, isLoading: isPatientsLoading } = useQuery({
        queryKey: ['patients', 'dialysis-medication', patientSearch],
        queryFn: () =>
            patientService.getPatients({
                page: 1,
                limit: 10,
                search: patientSearch || undefined,
                sortBy: patientSearch ? undefined : 'createdAt',
                sortOrder: patientSearch ? undefined : 'desc',
            }),
    });

    useEffect(() => {
        if (!order) return;
        setFormData({
            patientId: order.patientId,
            medicationName: order.medicationName,
            dose: order.dose || '',
            route: order.route || 'IV',
            frequency: order.frequency || '',
            startDate: order.startDate || '',
            endDate: order.endDate || '',
            lastAdministeredAt: order.lastAdministeredAt
                ? formatDateTimeLocal(new Date(order.lastAdministeredAt))
                : '',
            isActive: order.isActive ?? true,
            notes: order.notes || '',
        });
        if (order.patient) {
            setPatientInput(`${order.patient.firstName} ${order.patient.lastName}`);
        } else {
            setPatientInput(order.patientId);
        }
    }, [order]);

    const createMutation = useMutation({
        mutationFn: (payload: CreateDialysisMedicationOrderRequest) => dialysisMedicationService.createOrder(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dialysis-medications'] });
            navigate('/dialysis/medications');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (payload: CreateDialysisMedicationOrderRequest) => dialysisMedicationService.updateOrder(id!, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dialysis-medications'] });
            queryClient.invalidateQueries({ queryKey: ['dialysis-medication', id] });
            navigate('/dialysis/medications');
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

        const payload: CreateDialysisMedicationOrderRequest = {
            patientId: formData.patientId,
            medicationName: formData.medicationName,
            dose: formData.dose || undefined,
            route: formData.route || undefined,
            frequency: formData.frequency || undefined,
            startDate: formData.startDate || undefined,
            endDate: formData.endDate || undefined,
            lastAdministeredAt: formData.lastAdministeredAt || undefined,
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

    if (isEditMode && !order) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Medication order not found</p>
                <Link to="/dialysis/medications" className="text-blue-600 hover:underline mt-2 inline-block">
                    Back to medications
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

    const isSaving = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6 lg:pl-0">
            <div className="flex items-center gap-4 pt-2 lg:pt-0">
                <Link to="/dialysis/medications">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft size={18} className="mr-2" />
                        Back
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEditMode ? 'Edit Medication Order' : 'New Medication Order'}
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
                                    setPatientInput(option.label);
                                    setFormData((prev) => ({ ...prev, patientId: option.id }));
                                }}
                            />
                            <Input
                                label="Medication Name *"
                                name="medicationName"
                                value={formData.medicationName}
                                onChange={(e) => setFormData((prev) => ({ ...prev, medicationName: e.target.value }))}
                                required
                            />
                            <Input
                                label="Dose"
                                name="dose"
                                value={formData.dose}
                                onChange={(e) => setFormData((prev) => ({ ...prev, dose: e.target.value }))}
                            />
                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Route</label>
                                <select
                                    name="route"
                                    value={formData.route}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, route: e.target.value as DialysisMedicationRoute }))}
                                    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {routeOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <Input
                                label="Frequency"
                                name="frequency"
                                value={formData.frequency}
                                onChange={(e) => setFormData((prev) => ({ ...prev, frequency: e.target.value }))}
                                placeholder="e.g., Weekly"
                            />
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
                            <Input
                                label="Last Administered"
                                type="datetime-local"
                                name="lastAdministeredAt"
                                value={formData.lastAdministeredAt}
                                onChange={(e) => setFormData((prev) => ({ ...prev, lastAdministeredAt: e.target.value }))}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            Active order
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
                        {isEditMode ? 'Update Medication' : 'Save Medication'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
