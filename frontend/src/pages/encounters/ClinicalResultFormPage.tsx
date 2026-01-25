import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clinicalResultService } from '../../services/clinical-result.service';
import { clinicalOrderService } from '../../services/clinical-order.service';
import { patientService } from '../../services/patient.service';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, SearchableSelect } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import type { CreateClinicalResultRequest, ResultFlag, ResultStatus } from '../../types';
import type { SelectOption } from '../../components/ui/SearchableSelect';
import { formatDateTime } from '../../lib/utils';
import { ClinicalNav } from './ClinicalNav';

const statusOptions: ResultStatus[] = ['PENDING', 'FINAL', 'AMENDED'];
const flagOptions: ResultFlag[] = ['NORMAL', 'ABNORMAL', 'CRITICAL'];

const formatDateTimeLocal = (value: Date) => {
    const local = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
};

type ClinicalResultFormState = {
    orderId: string;
    patientId: string;
    reportedAt: string;
    resultName: string;
    value: string;
    unit: string;
    referenceRange: string;
    status: ResultStatus;
    flag: ResultFlag;
    notes: string;
};

export function ClinicalResultFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const isEditMode = Boolean(id);
    const [patientInput, setPatientInput] = useState('');
    const [orderInput, setOrderInput] = useState('');

    const defaultReportedAt = useMemo(() => formatDateTimeLocal(new Date()), []);

    const [formData, setFormData] = useState<ClinicalResultFormState>({
        orderId: '',
        patientId: '',
        reportedAt: defaultReportedAt,
        resultName: '',
        value: '',
        unit: '',
        referenceRange: '',
        status: 'PENDING',
        flag: 'NORMAL',
        notes: '',
    });

    const { data: result, isLoading } = useQuery({
        queryKey: ['clinical-result', id],
        queryFn: () => clinicalResultService.getResult(id!),
        enabled: isEditMode,
    });

    const patientSearch = patientInput.trim();
    const orderSearch = orderInput.trim();

    const { data: patientsData, isLoading: isPatientsLoading } = useQuery({
        queryKey: ['patients', 'clinical-result-picker', patientSearch],
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
        queryKey: ['clinical-orders', 'clinical-result-picker', orderSearch],
        queryFn: () =>
            clinicalOrderService.getOrders({
                page: 1,
                limit: 10,
                search: orderSearch || undefined,
            }),
    });

    useEffect(() => {
        if (!result) return;
        setFormData({
            orderId: result.orderId,
            patientId: result.patientId,
            reportedAt: formatDateTimeLocal(new Date(result.reportedAt)),
            resultName: result.resultName,
            value: result.value || '',
            unit: result.unit || '',
            referenceRange: result.referenceRange || '',
            status: result.status,
            flag: result.flag,
            notes: result.notes || '',
        });
        if (result.patient) {
            setPatientInput(`${result.patient.firstName} ${result.patient.lastName}`);
        } else {
            setPatientInput(result.patientId);
        }
        if (result.order) {
            setOrderInput(`${result.order.orderName} · ${result.order.orderType}`);
        } else {
            setOrderInput(result.orderId);
        }
    }, [result]);

    const createMutation = useMutation({
        mutationFn: (payload: CreateClinicalResultRequest) => clinicalResultService.createResult(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clinical-results'] });
            navigate('/clinical-results');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (payload: CreateClinicalResultRequest) => clinicalResultService.updateResult(id!, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clinical-results'] });
            queryClient.invalidateQueries({ queryKey: ['clinical-result', id] });
            navigate('/clinical-results');
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
        if (!formData.orderId) {
            setError('Please select an order.');
            return;
        }
        if (!formData.resultName.trim()) {
            setError('Please enter a result name.');
            return;
        }

        const payload: CreateClinicalResultRequest = {
            orderId: formData.orderId,
            patientId: formData.patientId,
            reportedAt: formData.reportedAt || undefined,
            resultName: formData.resultName.trim(),
            value: formData.value || undefined,
            unit: formData.unit || undefined,
            referenceRange: formData.referenceRange || undefined,
            status: formData.status,
            flag: formData.flag,
            notes: formData.notes || undefined,
        };

        if (isEditMode) {
            updateMutation.mutate(payload);
        } else {
            createMutation.mutate(payload);
        }
    };

    const patients = patientsData?.patients ?? [];
    const patientOptions: SelectOption[] = patients.map((patient) => ({
        id: patient.id,
        label: `${patient.firstName} ${patient.lastName}`,
        subLabel: patient.mrn,
    }));

    const orders = ordersData?.orders ?? [];
    const ordersById = new Map(orders.map((order) => [order.id, order]));
    const orderOptions: SelectOption[] = orders.map((order) => ({
        id: order.id,
        label: order.orderName,
        subLabel: `${order.orderType} · ${order.patient ? `${order.patient.firstName} ${order.patient.lastName}` : order.patientId}`,
    }));

    if (isEditMode && isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (isEditMode && !result) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Result not found</p>
                <Link to="/clinical-results" className="text-blue-600 hover:underline mt-2 inline-block">
                    Back to results
                </Link>
            </div>
        );
    }

    const isSaving = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6 lg:pl-0">
            <div className="flex items-center gap-4 pt-2 lg:pt-0">
                <Link to="/clinical-results">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft size={18} className="mr-2" />
                        Back
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEditMode ? 'Edit Clinical Result' : 'New Clinical Result'}
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
                        <CardTitle>Result Details</CardTitle>
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
                                label="Order"
                                value={orderInput}
                                required
                                options={orderOptions}
                                selectedId={formData.orderId}
                                isLoading={isOrdersLoading}
                                placeholder="Search orders"
                                onInputChange={setOrderInput}
                                onSelect={(option) => {
                                    const selectedOrder = ordersById.get(option.id);
                                    setFormData((prev) => ({
                                        ...prev,
                                        orderId: option.id,
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
                                label="Reported At"
                                type="datetime-local"
                                value={formData.reportedAt}
                                onChange={(e) => setFormData((prev) => ({ ...prev, reportedAt: e.target.value }))}
                            />
                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                                    value={formData.status}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, status: e.target.value as ResultStatus }))
                                    }
                                >
                                    {statusOptions.map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Flag</label>
                                <select
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                                    value={formData.flag}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, flag: e.target.value as ResultFlag }))
                                    }
                                >
                                    {flagOptions.map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <Input
                            label="Result Name"
                            value={formData.resultName}
                            onChange={(e) => setFormData((prev) => ({ ...prev, resultName: e.target.value }))}
                            placeholder="e.g., Hemoglobin"
                            required
                        />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="Value"
                                value={formData.value}
                                onChange={(e) => setFormData((prev) => ({ ...prev, value: e.target.value }))}
                            />
                            <Input
                                label="Unit"
                                value={formData.unit}
                                onChange={(e) => setFormData((prev) => ({ ...prev, unit: e.target.value }))}
                            />
                            <Input
                                label="Reference Range"
                                value={formData.referenceRange}
                                onChange={(e) => setFormData((prev) => ({ ...prev, referenceRange: e.target.value }))}
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
                        {isEditMode ? 'Update Result' : 'Save Result'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
