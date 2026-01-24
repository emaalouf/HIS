import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { neurologyService } from '../../services/neurology.service';
import { Button, Card, Input } from '../../components/ui';
import { formatDateTime } from '../../lib/utils';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import type { NeurologyVisit, NeurologyVisitStatus } from '../../types';
import { NeurologyNav } from './NeurologyNav';

const statusStyles: Record<NeurologyVisitStatus, string> = {
    SCHEDULED: 'bg-slate-100 text-slate-700',
    IN_PROGRESS: 'bg-amber-100 text-amber-700',
    COMPLETED: 'bg-emerald-100 text-emerald-700',
    CANCELLED: 'bg-rose-100 text-rose-700',
};

const statusOptions: NeurologyVisitStatus[] = [
    'SCHEDULED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
];

export function NeurologyListPage() {
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState<NeurologyVisitStatus | ''>('');
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const limit = 10;
    const patientIdParam = searchParams.get('patientId') || '';

    const { data, isLoading } = useQuery({
        queryKey: ['neurology-visits', page, status, search, patientIdParam],
        queryFn: () =>
            neurologyService.getVisits({
                page,
                limit,
                status: status || undefined,
                search: search || undefined,
                patientId: patientIdParam || undefined,
            }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => neurologyService.deleteVisit(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['neurology-visits'] });
        },
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    const handleDelete = (visit: NeurologyVisit) => {
        if (deleteMutation.isPending) return;
        if (window.confirm('Delete this neurology visit? This cannot be undone.')) {
            deleteMutation.mutate(visit.id);
        }
    };

    const visits = data?.visits ?? [];
    const pagination = data?.pagination;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Neurology</h1>
                    <p className="text-gray-500 mt-1">Document neuro exams, assessments, and care plans.</p>
                </div>
                <Link to="/neurology/new">
                    <Button>
                        <Plus size={18} className="mr-2" />
                        New Visit
                    </Button>
                </Link>
            </div>

            <NeurologyNav />

            <Card className="p-4">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            placeholder="Search by patient, MRN, provider, or diagnosis..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="w-full md:w-48">
                        <select
                            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value as NeurologyVisitStatus | '');
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
                {patientIdParam && (
                    <p className="mt-3 text-sm text-sky-600">
                        Filtered by patient ID: {patientIdParam}
                    </p>
                )}
            </Card>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Patient</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Provider</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Visit Date</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Reason</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Loading visits...
                                    </td>
                                </tr>
                            ) : visits.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No visits found
                                    </td>
                                </tr>
                            ) : (
                                visits.map((visit) => (
                                    <tr key={visit.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">
                                                {visit.patient
                                                    ? `${visit.patient.firstName} ${visit.patient.lastName}`
                                                    : visit.patientId}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {visit.patient?.mrn || visit.patientId}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {visit.provider
                                                ? `Dr. ${visit.provider.firstName} ${visit.provider.lastName}`
                                                : visit.providerId}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {formatDateTime(visit.visitDate)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            <div className="font-medium text-gray-900">{visit.reason || '--'}</div>
                                            <div className="text-xs text-gray-500">
                                                NIHSS: {visit.nihssScore ?? '--'} | GCS: {visit.gcsScore ?? '--'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[visit.status]}`}>
                                                {visit.status.split('_').join(' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link to={`/neurology/${visit.id}/edit`}>
                                                    <Button variant="outline" size="sm">
                                                        <Pencil size={16} />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(visit)}
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
                            Showing {((page - 1) * pagination.limit) + 1}-
                            {Math.min(page * pagination.limit, pagination.total)} of {pagination.total}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                            >
                                Prev
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === pagination.totalPages}
                                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
