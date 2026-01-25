import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '../../services/payment.service';
import { Button, Card } from '../../components/ui';
import { formatDateTime } from '../../lib/utils';
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Payment, PaymentMethod } from '../../types';
import { BillingNav } from './BillingNav';

const methodOptions: PaymentMethod[] = [
    'CASH',
    'CARD',
    'TRANSFER',
    'CHECK',
    'OTHER',
];

const formatAmount = (value: number) => value.toFixed(2);

export function PaymentsPage() {
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const [page, setPage] = useState(1);
    const [method, setMethod] = useState<PaymentMethod | ''>('');
    const limit = 10;
    const patientIdParam = searchParams.get('patientId') || '';
    const invoiceIdParam = searchParams.get('invoiceId') || '';

    const { data, isLoading } = useQuery({
        queryKey: ['payments', page, method, patientIdParam, invoiceIdParam],
        queryFn: () =>
            paymentService.getPayments({
                page,
                limit,
                method: method || undefined,
                patientId: patientIdParam || undefined,
                invoiceId: invoiceIdParam || undefined,
            }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => paymentService.deletePayment(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payments'] });
        },
    });

    const handleDelete = (payment: Payment) => {
        if (deleteMutation.isPending) return;
        if (window.confirm('Delete this payment? This cannot be undone.')) {
            deleteMutation.mutate(payment.id);
        }
    };

    const payments = data?.payments ?? [];
    const pagination = data?.pagination;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
                    <p className="text-gray-500 mt-1">Record patient payments and receipts.</p>
                </div>
                <Link to="/billing/payments/new">
                    <Button>
                        <Plus size={18} className="mr-2" />
                        New Payment
                    </Button>
                </Link>
            </div>

            <BillingNav />

            <Card className="p-4">
                <form className="flex flex-col md:flex-row gap-3">
                    <div className="w-full md:w-64">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                        <select
                            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                            value={method}
                            onChange={(e) => {
                                setMethod(e.target.value as PaymentMethod | '');
                                setPage(1);
                            }}
                        >
                            <option value="">All methods</option>
                            {methodOptions.map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                    {(patientIdParam || invoiceIdParam) && (
                        <div className="flex items-end text-sm text-amber-600">
                            {patientIdParam && `Filtered by patient ID: ${patientIdParam}`}
                            {patientIdParam && invoiceIdParam ? ' | ' : ''}
                            {invoiceIdParam && `Invoice ID: ${invoiceIdParam}`}
                        </div>
                    )}
                </form>
            </Card>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Patient</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Invoice</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Amount</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Method</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Paid At</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Loading payments...
                                    </td>
                                </tr>
                            ) : payments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No payments found
                                    </td>
                                </tr>
                            ) : (
                                payments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">
                                                {payment.patient
                                                    ? `${payment.patient.firstName} ${payment.patient.lastName}`
                                                    : payment.patientId}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {payment.patient?.mrn || payment.patientId}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {payment.invoice?.invoiceNumber || payment.invoiceId}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            ${formatAmount(payment.amount)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{payment.method}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {formatDateTime(payment.paidAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link to={`/billing/payments/${payment.id}/edit`}>
                                                    <Button variant="outline" size="sm">
                                                        <Pencil size={16} />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(payment)}
                                                    disabled={deleteMutation.isPending}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {pagination && pagination.totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} payments
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                <ChevronLeft size={16} />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                                disabled={page === pagination.totalPages}
                            >
                                <ChevronRight size={16} />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
