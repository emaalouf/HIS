import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '../../services/payment.service';
import { invoiceService } from '../../services/invoice.service';
import { patientService } from '../../services/patient.service';
import { providerService } from '../../services/provider.service';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, SearchableSelect } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import type { CreatePaymentRequest, PaymentMethod } from '../../types';
import type { SelectOption } from '../../components/ui/SearchableSelect';
import { BillingNav } from './BillingNav';

const methodOptions: PaymentMethod[] = [
    'CASH',
    'CARD',
    'TRANSFER',
    'CHECK',
    'OTHER',
];

const formatDateTimeLocal = (value: Date) => {
    const local = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
};

type PaymentFormState = {
    invoiceId: string;
    patientId: string;
    amount: string;
    method: PaymentMethod;
    paidAt: string;
    reference: string;
    receivedById: string;
    notes: string;
};

const parseNumber = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const num = Number(trimmed);
    return Number.isFinite(num) ? num : undefined;
};

export function PaymentFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const isEditMode = Boolean(id);
    const [patientInput, setPatientInput] = useState('');
    const [invoiceInput, setInvoiceInput] = useState('');
    const [receivedByInput, setReceivedByInput] = useState('');

    const defaultPaidAt = useMemo(() => formatDateTimeLocal(new Date()), []);

    const [formData, setFormData] = useState<PaymentFormState>({
        invoiceId: '',
        patientId: '',
        amount: '',
        method: 'CASH',
        paidAt: defaultPaidAt,
        reference: '',
        receivedById: '',
        notes: '',
    });

    const { data: payment, isLoading } = useQuery({
        queryKey: ['payment', id],
        queryFn: () => paymentService.getPayment(id!),
        enabled: isEditMode,
    });

    const patientSearch = patientInput.trim();
    const invoiceSearch = invoiceInput.trim();
    const receivedBySearch = receivedByInput.trim();

    const { data: patientsData, isLoading: isPatientsLoading } = useQuery({
        queryKey: ['patients', 'payment-picker', patientSearch],
        queryFn: () =>
            patientService.getPatients({
                page: 1,
                limit: 10,
                search: patientSearch || undefined,
                sortBy: patientSearch ? undefined : 'createdAt',
                sortOrder: patientSearch ? undefined : 'desc',
            }),
    });

    const { data: invoicesData, isLoading: isInvoicesLoading } = useQuery({
        queryKey: ['invoices', 'payment-picker', invoiceSearch],
        queryFn: () =>
            invoiceService.getInvoices({
                page: 1,
                limit: 10,
                search: invoiceSearch || undefined,
            }),
    });

    const { data: providersData, isLoading: isProvidersLoading } = useQuery({
        queryKey: ['providers', 'payment-picker', receivedBySearch],
        queryFn: () =>
            providerService.getProviders({
                page: 1,
                limit: 10,
                search: receivedBySearch || undefined,
                sortBy: receivedBySearch ? undefined : 'createdAt',
                sortOrder: receivedBySearch ? undefined : 'desc',
            }),
    });

    useEffect(() => {
        if (!payment) return;
        setFormData({
            invoiceId: payment.invoiceId,
            patientId: payment.patientId,
            amount: payment.amount.toFixed(2),
            method: payment.method,
            paidAt: formatDateTimeLocal(new Date(payment.paidAt)),
            reference: payment.reference || '',
            receivedById: payment.receivedById || '',
            notes: payment.notes || '',
        });
        if (payment.patient) {
            setPatientInput(`${payment.patient.firstName} ${payment.patient.lastName}`);
        } else {
            setPatientInput(payment.patientId);
        }
        if (payment.invoice) {
            setInvoiceInput(payment.invoice.invoiceNumber);
        } else {
            setInvoiceInput(payment.invoiceId);
        }
        if (payment.receivedBy) {
            const prefix = payment.receivedBy.role === 'DOCTOR' ? 'Dr. ' : '';
            setReceivedByInput(`${prefix}${payment.receivedBy.firstName} ${payment.receivedBy.lastName}`);
        } else if (payment.receivedById) {
            setReceivedByInput(payment.receivedById);
        }
    }, [payment]);

    const createMutation = useMutation({
        mutationFn: (payload: CreatePaymentRequest) => paymentService.createPayment(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payments'] });
            navigate('/billing/payments');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (payload: CreatePaymentRequest) => paymentService.updatePayment(id!, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payments'] });
            queryClient.invalidateQueries({ queryKey: ['payment', id] });
            navigate('/billing/payments');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.invoiceId) {
            setError('Please select an invoice.');
            return;
        }
        if (!formData.patientId) {
            setError('Please select a patient.');
            return;
        }
        const amount = parseNumber(formData.amount);
        if (amount === undefined || amount <= 0) {
            setError('Please enter a valid payment amount.');
            return;
        }

        const payload: CreatePaymentRequest = {
            invoiceId: formData.invoiceId,
            patientId: formData.patientId,
            amount,
            method: formData.method,
            paidAt: formData.paidAt || undefined,
            reference: formData.reference || undefined,
            receivedById: formData.receivedById || undefined,
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

    const invoices = invoicesData?.invoices || [];
    const invoicesById = new Map(invoices.map((invoice) => [invoice.id, invoice]));
    const invoiceOptions: SelectOption[] = invoices.map((invoice) => ({
        id: invoice.id,
        label: invoice.invoiceNumber,
        subLabel: invoice.patient
            ? `${invoice.patient.firstName} ${invoice.patient.lastName}`
            : invoice.patientId,
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

    if (isEditMode && !payment) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Payment not found</p>
                <Link to="/billing/payments" className="text-blue-600 hover:underline mt-2 inline-block">
                    Back to payments
                </Link>
            </div>
        );
    }

    const isSaving = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6 lg:pl-0">
            <div className="flex items-center gap-4 pt-2 lg:pt-0">
                <Link to="/billing/payments">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft size={18} className="mr-2" />
                        Back
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEditMode ? 'Edit Payment' : 'New Payment'}
                </h1>
            </div>

            <BillingNav />

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
                        <CardTitle>Payment Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SearchableSelect
                                label="Invoice"
                                value={invoiceInput}
                                required
                                options={invoiceOptions}
                                selectedId={formData.invoiceId}
                                isLoading={isInvoicesLoading}
                                placeholder="Search invoices"
                                onInputChange={setInvoiceInput}
                                onSelect={(option) => {
                                    const selectedInvoice = invoicesById.get(option.id);
                                    setFormData((prev) => ({
                                        ...prev,
                                        invoiceId: option.id,
                                        patientId: selectedInvoice?.patientId || prev.patientId,
                                    }));
                                    setInvoiceInput(option.label);
                                    if (selectedInvoice?.patient) {
                                        setPatientInput(`${selectedInvoice.patient.firstName} ${selectedInvoice.patient.lastName}`);
                                    }
                                }}
                            />
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
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="Amount"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.amount}
                                onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                                required
                            />
                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                                <select
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                                    value={formData.method}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, method: e.target.value as PaymentMethod }))
                                    }
                                >
                                    {methodOptions.map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                            <Input
                                label="Paid At"
                                type="datetime-local"
                                value={formData.paidAt}
                                onChange={(e) => setFormData((prev) => ({ ...prev, paidAt: e.target.value }))}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Reference"
                                value={formData.reference}
                                onChange={(e) => setFormData((prev) => ({ ...prev, reference: e.target.value }))}
                                placeholder="Optional reference"
                            />
                            <SearchableSelect
                                label="Received By"
                                value={receivedByInput}
                                options={providerOptions}
                                selectedId={formData.receivedById}
                                isLoading={isProvidersLoading}
                                placeholder="Search staff"
                                onInputChange={setReceivedByInput}
                                onSelect={(option) => {
                                    setFormData((prev) => ({ ...prev, receivedById: option.id }));
                                    setReceivedByInput(option.label);
                                }}
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
                        {isEditMode ? 'Update Payment' : 'Save Payment'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
