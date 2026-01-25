import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { claimService } from '../../services/claim.service';
import { invoiceService } from '../../services/invoice.service';
import { patientService } from '../../services/patient.service';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, SearchableSelect } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import type { ClaimStatus, CreateClaimRequest } from '../../types';
import type { SelectOption } from '../../components/ui/SearchableSelect';
import { BillingNav } from './BillingNav';

const statusOptions: ClaimStatus[] = [
    'DRAFT',
    'SUBMITTED',
    'ACCEPTED',
    'DENIED',
    'PAID',
];

type ClaimFormState = {
    invoiceId: string;
    patientId: string;
    payerName: string;
    status: ClaimStatus;
    submittedAt: string;
    resolvedAt: string;
    notes: string;
};

export function ClaimFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const isEditMode = Boolean(id);
    const [patientInput, setPatientInput] = useState('');
    const [invoiceInput, setInvoiceInput] = useState('');

    const [formData, setFormData] = useState<ClaimFormState>({
        invoiceId: '',
        patientId: '',
        payerName: '',
        status: 'DRAFT',
        submittedAt: '',
        resolvedAt: '',
        notes: '',
    });

    const { data: claim, isLoading } = useQuery({
        queryKey: ['claim', id],
        queryFn: () => claimService.getClaim(id!),
        enabled: isEditMode,
    });

    const patientSearch = patientInput.trim();
    const invoiceSearch = invoiceInput.trim();

    const { data: patientsData, isLoading: isPatientsLoading } = useQuery({
        queryKey: ['patients', 'claim-picker', patientSearch],
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
        queryKey: ['invoices', 'claim-picker', invoiceSearch],
        queryFn: () =>
            invoiceService.getInvoices({
                page: 1,
                limit: 10,
                search: invoiceSearch || undefined,
            }),
    });

    useEffect(() => {
        if (!claim) return;
        setFormData({
            invoiceId: claim.invoiceId,
            patientId: claim.patientId,
            payerName: claim.payerName,
            status: claim.status,
            submittedAt: claim.submittedAt ? claim.submittedAt.slice(0, 10) : '',
            resolvedAt: claim.resolvedAt ? claim.resolvedAt.slice(0, 10) : '',
            notes: claim.notes || '',
        });
        if (claim.patient) {
            setPatientInput(`${claim.patient.firstName} ${claim.patient.lastName}`);
        } else {
            setPatientInput(claim.patientId);
        }
        if (claim.invoice) {
            setInvoiceInput(claim.invoice.invoiceNumber);
        } else {
            setInvoiceInput(claim.invoiceId);
        }
    }, [claim]);

    const createMutation = useMutation({
        mutationFn: (payload: CreateClaimRequest) => claimService.createClaim(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['claims'] });
            navigate('/billing/claims');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (payload: CreateClaimRequest) => claimService.updateClaim(id!, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['claims'] });
            queryClient.invalidateQueries({ queryKey: ['claim', id] });
            navigate('/billing/claims');
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
        if (!formData.payerName.trim()) {
            setError('Please enter a payer name.');
            return;
        }

        const payload: CreateClaimRequest = {
            invoiceId: formData.invoiceId,
            patientId: formData.patientId,
            payerName: formData.payerName.trim(),
            status: formData.status,
            submittedAt: formData.submittedAt || undefined,
            resolvedAt: formData.resolvedAt || undefined,
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

    if (isEditMode && isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (isEditMode && !claim) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Claim not found</p>
                <Link to="/billing/claims" className="text-blue-600 hover:underline mt-2 inline-block">
                    Back to claims
                </Link>
            </div>
        );
    }

    const isSaving = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6 lg:pl-0">
            <div className="flex items-center gap-4 pt-2 lg:pt-0">
                <Link to="/billing/claims">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft size={18} className="mr-2" />
                        Back
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEditMode ? 'Edit Claim' : 'New Claim'}
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
                        <CardTitle>Claim Details</CardTitle>
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
                        <Input
                            label="Payer Name"
                            value={formData.payerName}
                            onChange={(e) => setFormData((prev) => ({ ...prev, payerName: e.target.value }))}
                            placeholder="Insurance payer"
                            required
                        />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                                    value={formData.status}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, status: e.target.value as ClaimStatus }))
                                    }
                                >
                                    {statusOptions.map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                            <Input
                                label="Submitted At"
                                type="date"
                                value={formData.submittedAt}
                                onChange={(e) => setFormData((prev) => ({ ...prev, submittedAt: e.target.value }))}
                            />
                            <Input
                                label="Resolved At"
                                type="date"
                                value={formData.resolvedAt}
                                onChange={(e) => setFormData((prev) => ({ ...prev, resolvedAt: e.target.value }))}
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
                        {isEditMode ? 'Update Claim' : 'Save Claim'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
