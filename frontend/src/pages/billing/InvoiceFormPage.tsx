import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invoiceService } from '../../services/invoice.service';
import { encounterService } from '../../services/encounter.service';
import { patientService } from '../../services/patient.service';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, SearchableSelect } from '../../components/ui';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import type { CreateInvoiceRequest, InvoiceStatus } from '../../types';
import type { SelectOption } from '../../components/ui/SearchableSelect';
import { formatDateTime } from '../../lib/utils';
import { BillingNav } from './BillingNav';

const statusOptions: InvoiceStatus[] = [
    'DRAFT',
    'ISSUED',
    'SUBMITTED',
    'PARTIAL',
    'PAID',
    'DENIED',
    'VOID',
];

type InvoiceItemForm = {
    description: string;
    quantity: string;
    unitPrice: string;
};

type InvoiceFormState = {
    patientId: string;
    encounterId: string;
    status: InvoiceStatus;
    dueDate: string;
    notes: string;
    totalAmount: string;
};

const emptyItem: InvoiceItemForm = {
    description: '',
    quantity: '1',
    unitPrice: '',
};

const parseNumber = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const num = Number(trimmed);
    return Number.isFinite(num) ? num : undefined;
};

const computeTotal = (items: InvoiceItemForm[]) => {
    return items.reduce((sum, item) => {
        if (!item.description.trim()) return sum;
        const quantity = parseNumber(item.quantity) ?? 1;
        const unitPrice = parseNumber(item.unitPrice) ?? 0;
        return sum + quantity * unitPrice;
    }, 0);
};

export function InvoiceFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const isEditMode = Boolean(id);
    const [patientInput, setPatientInput] = useState('');
    const [encounterInput, setEncounterInput] = useState('');

    const [formData, setFormData] = useState<InvoiceFormState>({
        patientId: '',
        encounterId: '',
        status: 'DRAFT',
        dueDate: '',
        notes: '',
        totalAmount: '',
    });

    const [items, setItems] = useState<InvoiceItemForm[]>([emptyItem]);

    const { data: invoice, isLoading } = useQuery({
        queryKey: ['invoice', id],
        queryFn: () => invoiceService.getInvoice(id!),
        enabled: isEditMode,
    });

    const patientSearch = patientInput.trim();
    const encounterSearch = encounterInput.trim();

    const { data: patientsData, isLoading: isPatientsLoading } = useQuery({
        queryKey: ['patients', 'invoice-picker', patientSearch],
        queryFn: () =>
            patientService.getPatients({
                page: 1,
                limit: 10,
                search: patientSearch || undefined,
                sortBy: patientSearch ? undefined : 'createdAt',
                sortOrder: patientSearch ? undefined : 'desc',
            }),
    });

    const { data: encountersData, isLoading: isEncountersLoading } = useQuery({
        queryKey: ['encounters', 'invoice-picker', encounterSearch],
        queryFn: () =>
            encounterService.getEncounters({
                page: 1,
                limit: 10,
                search: encounterSearch || undefined,
            }),
    });

    useEffect(() => {
        if (!invoice) return;
        setFormData({
            patientId: invoice.patientId,
            encounterId: invoice.encounterId || '',
            status: invoice.status,
            dueDate: invoice.dueDate ? invoice.dueDate.slice(0, 10) : '',
            notes: invoice.notes || '',
            totalAmount: invoice.totalAmount ? invoice.totalAmount.toFixed(2) : '',
        });
        if (invoice.items && invoice.items.length > 0) {
            setItems(
                invoice.items.map((item) => ({
                    description: item.description,
                    quantity: (item.quantity ?? 1).toString(),
                    unitPrice: item.unitPrice.toFixed(2),
                }))
            );
        } else {
            setItems([emptyItem]);
        }
        if (invoice.patient) {
            setPatientInput(`${invoice.patient.firstName} ${invoice.patient.lastName}`);
        } else {
            setPatientInput(invoice.patientId);
        }
        if (invoice.encounter) {
            setEncounterInput(`${formatDateTime(invoice.encounter.startTime)} - ${invoice.encounter.id}`);
        } else if (invoice.encounterId) {
            setEncounterInput(invoice.encounterId);
        }
    }, [invoice]);

    const createMutation = useMutation({
        mutationFn: (payload: CreateInvoiceRequest) => invoiceService.createInvoice(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            navigate('/billing');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (payload: CreateInvoiceRequest) => invoiceService.updateInvoice(id!, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            queryClient.invalidateQueries({ queryKey: ['invoice', id] });
            navigate('/billing');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const handleItemChange = (index: number, field: keyof InvoiceItemForm, value: string) => {
        setItems((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    const handleAddItem = () => {
        setItems((prev) => [...prev, emptyItem]);
    };

    const handleRemoveItem = (index: number) => {
        setItems((prev) => {
            if (prev.length === 1) {
                return [emptyItem];
            }
            return prev.filter((_, itemIndex) => itemIndex !== index);
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.patientId) {
            setError('Please select a patient.');
            return;
        }

        const cleanedItems = items
            .map((item) => ({
                description: item.description.trim(),
                quantity: parseNumber(item.quantity),
                unitPrice: parseNumber(item.unitPrice),
            }))
            .filter((item) => item.description || item.quantity !== undefined || item.unitPrice !== undefined);

        const itemsToSend = cleanedItems.filter((item) => item.description);

        if (itemsToSend.length > 0 && itemsToSend.some((item) => item.unitPrice === undefined)) {
            setError('Each item must include a unit price.');
            return;
        }

        if (itemsToSend.length === 0) {
            const manualTotal = parseNumber(formData.totalAmount);
            if (manualTotal === undefined || manualTotal <= 0) {
                setError('Provide at least one item or a total amount.');
                return;
            }
        }

        const payload: CreateInvoiceRequest = {
            patientId: formData.patientId,
            encounterId: formData.encounterId || undefined,
            status: formData.status,
            dueDate: formData.dueDate || undefined,
            notes: formData.notes || undefined,
            items: itemsToSend.length > 0
                ? itemsToSend.map((item) => ({
                    description: item.description,
                    quantity: item.quantity ?? undefined,
                    unitPrice: item.unitPrice as number,
                }))
                : undefined,
            totalAmount: itemsToSend.length === 0 ? parseNumber(formData.totalAmount) : undefined,
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

    const encounterOptions: SelectOption[] = (encountersData?.encounters || []).map((encounter) => ({
        id: encounter.id,
        label: encounter.patient
            ? `${encounter.patient.firstName} ${encounter.patient.lastName}`
            : encounter.patientId,
        subLabel: `${formatDateTime(encounter.startTime)} - ${encounter.status}`,
    }));

    const hasItems = items.some((item) => item.description.trim());
    const computedTotal = useMemo(() => computeTotal(items), [items]);

    if (isEditMode && isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (isEditMode && !invoice) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Invoice not found</p>
                <Link to="/billing" className="text-blue-600 hover:underline mt-2 inline-block">
                    Back to invoices
                </Link>
            </div>
        );
    }

    const isSaving = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6 lg:pl-0">
            <div className="flex items-center gap-4 pt-2 lg:pt-0">
                <Link to="/billing">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft size={18} className="mr-2" />
                        Back
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEditMode ? 'Edit Invoice' : 'New Invoice'}
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
                        <CardTitle>Invoice Details</CardTitle>
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                                    value={formData.status}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, status: e.target.value as InvoiceStatus }))
                                    }
                                >
                                    {statusOptions.map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                            <Input
                                label="Due Date"
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Invoice Items</CardTitle>
                        <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                            <Plus size={16} className="mr-2" />
                            Add Item
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Description</th>
                                        <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Qty</th>
                                        <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Unit Price</th>
                                        <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Total</th>
                                        <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {items.map((item, index) => {
                                        const quantity = parseNumber(item.quantity) ?? 1;
                                        const unitPrice = parseNumber(item.unitPrice) ?? 0;
                                        const lineTotal = quantity * unitPrice;

                                        return (
                                            <tr key={`item-${index}`}>
                                                <td className="px-4 py-3">
                                                    <input
                                                        className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                                                        placeholder="Description"
                                                        value={item.description}
                                                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        className="w-24 rounded-md border border-gray-200 px-3 py-2 text-sm"
                                                        type="number"
                                                        min="1"
                                                        step="1"
                                                        value={item.quantity}
                                                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        className="w-32 rounded-md border border-gray-200 px-3 py-2 text-sm"
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={item.unitPrice}
                                                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-700">
                                                    ${lineTotal.toFixed(2)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRemoveItem(index)}
                                                    >
                                                        <Trash2 size={16} className="text-rose-500" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {hasItems ? (
                            <div className="text-right text-sm text-gray-700">
                                Computed total: <span className="font-semibold">${computedTotal.toFixed(2)}</span>
                            </div>
                        ) : (
                            <Input
                                label="Total Amount"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.totalAmount}
                                onChange={(e) => setFormData((prev) => ({ ...prev, totalAmount: e.target.value }))}
                                placeholder="Enter total amount"
                            />
                        )}
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
                        {isEditMode ? 'Update Invoice' : 'Save Invoice'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
