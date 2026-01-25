import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { medicationOrderService } from '../../services/medication-order.service';
import { Button, Card, Input } from '../../components/ui';
import { formatDate } from '../../lib/utils';
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { MedicationOrder, MedicationOrderStatus } from '../../types';
import { PharmacyNav } from './PharmacyNav';

const statusStyles: Record<MedicationOrderStatus, string> = {
    ACTIVE: 'bg-emerald-100 text-emerald-700',
    ON_HOLD: 'bg-amber-100 text-amber-700',
    COMPLETED: 'bg-sky-100 text-sky-700',
    DISCONTINUED: 'bg-rose-100 text-rose-700',
};

const statusOptions: MedicationOrderStatus[] = [
    'ACTIVE',
    'ON_HOLD',
    'COMPLETED',
    'DISCONTINUED',
];

export function MedicationOrdersPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState<MedicationOrderStatus | ''>('');
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const limit = 10;

    const { data, isLoading } = useQuery({
        queryKey: ['medication-orders', page, status, search],
        queryFn: () =>
            medicationOrderService.getOrders({
                page,
                limit,
                status: status || undefined,
                search: search || undefined,
            }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => medicationOrderService.deleteOrder(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['medication-orders'] });
        },
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    const handleDelete = (order: MedicationOrder) => {
        if (deleteMutation.isPending) return;
        if (window.confirm('Delete this medication order? This cannot be undone.')) {
            deleteMutation.mutate(order.id);
        }
    };

    const orders = data?.orders ?? [];
    const pagination = data?.pagination;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Medication Orders</h1>
                    <p className="text-gray-500 mt-1">Manage active medications and dosing plans.</p>
                </div>
                <Link to="/pharmacy/medication-orders/new">
                    <Button>
                        <Plus size={18} className="mr-2" />
                        New Medication
                    </Button>
                </Link>
            </div>

            <PharmacyNav />

            <Card className="p-4">
                <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            placeholder="Search by patient, medication, or provider..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="w-full lg:w-48">
                        <select
                            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value as MedicationOrderStatus | '');
                                setPage(1);
                            }}
                        >
                            <option value="">All statuses</option>
                            {statusOptions.map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                    <Button type="submit">Search</Button>
                </form>
            </Card>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Patient</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Medication</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Route</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Start</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Loading medication orders...
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No medication orders found
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">
                                                {order.patient
                                                    ? `${order.patient.firstName} ${order.patient.lastName}`
                                                    : order.patientId}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {order.patient?.mrn || order.patientId}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            <div className="font-medium text-gray-900">{order.medicationName}</div>
                                            <div className="text-xs text-gray-500">{order.dose || '--'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {order.route || '--'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {order.startDate ? formatDate(order.startDate) : '--'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[order.status]}`}>
                                                {order.status.split('_').join(' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link to={`/pharmacy/medication-orders/${order.id}/edit`}>
                                                    <Button variant="outline" size="sm">
                                                        <Pencil size={16} />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(order)}
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
                            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} orders
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
