import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { medicationAdministrationService } from '../../services/medication-administration.service';
import { Button, Card } from '../../components/ui';
import { formatDateTime } from '../../lib/utils';
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { MedicationAdministration, MedicationAdministrationStatus } from '../../types';
import { PharmacyNav } from './PharmacyNav';

const statusStyles: Record<MedicationAdministrationStatus, string> = {
    GIVEN: 'bg-emerald-100 text-emerald-700',
    HELD: 'bg-amber-100 text-amber-700',
    REFUSED: 'bg-slate-100 text-slate-700',
    MISSED: 'bg-rose-100 text-rose-700',
};

const statusOptions: MedicationAdministrationStatus[] = [
    'GIVEN',
    'HELD',
    'REFUSED',
    'MISSED',
];

export function MedicationAdministrationsPage() {
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState<MedicationAdministrationStatus | ''>('');
    const limit = 10;
    const patientIdParam = searchParams.get('patientId') || '';
    const orderIdParam = searchParams.get('orderId') || '';

    const { data, isLoading } = useQuery({
        queryKey: ['medication-administrations', page, status, patientIdParam, orderIdParam],
        queryFn: () =>
            medicationAdministrationService.getAdministrations({
                page,
                limit,
                status: status || undefined,
                patientId: patientIdParam || undefined,
                medicationOrderId: orderIdParam || undefined,
            }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => medicationAdministrationService.deleteAdministration(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['medication-administrations'] });
        },
    });

    const handleDelete = (administration: MedicationAdministration) => {
        if (deleteMutation.isPending) return;
        if (window.confirm('Delete this administration record? This cannot be undone.')) {
            deleteMutation.mutate(administration.id);
        }
    };

    const administrations = data?.administrations ?? [];
    const pagination = data?.pagination;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Medication Administrations</h1>
                    <p className="text-gray-500 mt-1">Document administered doses and outcomes.</p>
                </div>
                <Link to="/pharmacy/administrations/new">
                    <Button>
                        <Plus size={18} className="mr-2" />
                        New Administration
                    </Button>
                </Link>
            </div>

            <PharmacyNav />

            <Card className="p-4">
                <form className="flex flex-col md:flex-row gap-3">
                    <div className="w-full md:w-64">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value as MedicationAdministrationStatus | '');
                                setPage(1);
                            }}
                        >
                            <option value="">All statuses</option>
                            {statusOptions.map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                    {(patientIdParam || orderIdParam) && (
                        <div className="flex items-end text-sm text-teal-600">
                            {patientIdParam && `Filtered by patient ID: ${patientIdParam}`}
                            {patientIdParam && orderIdParam ? ' • ' : ''}
                            {orderIdParam && `Order ID: ${orderIdParam}`}
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
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Medication</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Dose Given</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Administered At</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Loading administrations...
                                    </td>
                                </tr>
                            ) : administrations.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No administrations found
                                    </td>
                                </tr>
                            ) : (
                                administrations.map((administration) => (
                                    <tr key={administration.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">
                                                {administration.patient
                                                    ? `${administration.patient.firstName} ${administration.patient.lastName}`
                                                    : administration.patientId}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {administration.patient?.mrn || administration.patientId}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            <div className="font-medium text-gray-900">
                                                {administration.medicationOrder?.medicationName || administration.medicationOrderId}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {administration.medicationOrder?.dose || '--'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {administration.doseGiven || '--'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {formatDateTime(administration.administeredAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[administration.status]}`}>
                                                {administration.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link to={`/pharmacy/administrations/${administration.id}/edit`}>
                                                    <Button variant="outline" size="sm">
                                                        <Pencil size={16} />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(administration)}
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
                            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} administrations
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
