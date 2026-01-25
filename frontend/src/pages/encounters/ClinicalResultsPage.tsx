import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clinicalResultService } from '../../services/clinical-result.service';
import { Button, Card, Input } from '../../components/ui';
import { formatDateTime } from '../../lib/utils';
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ClinicalResult, ResultFlag, ResultStatus } from '../../types';
import { ClinicalNav } from './ClinicalNav';

const statusStyles: Record<ResultStatus, string> = {
    PENDING: 'bg-amber-100 text-amber-700',
    FINAL: 'bg-emerald-100 text-emerald-700',
    AMENDED: 'bg-sky-100 text-sky-700',
};

const flagStyles: Record<ResultFlag, string> = {
    NORMAL: 'bg-emerald-100 text-emerald-700',
    ABNORMAL: 'bg-amber-100 text-amber-700',
    CRITICAL: 'bg-rose-100 text-rose-700',
};

const statusOptions: ResultStatus[] = ['PENDING', 'FINAL', 'AMENDED'];
const flagOptions: ResultFlag[] = ['NORMAL', 'ABNORMAL', 'CRITICAL'];

export function ClinicalResultsPage() {
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState<ResultStatus | ''>('');
    const [flag, setFlag] = useState<ResultFlag | ''>('');
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const limit = 10;
    const patientIdParam = searchParams.get('patientId') || '';
    const orderIdParam = searchParams.get('orderId') || '';

    const { data, isLoading } = useQuery({
        queryKey: ['clinical-results', page, status, flag, search, patientIdParam, orderIdParam],
        queryFn: () =>
            clinicalResultService.getResults({
                page,
                limit,
                status: status || undefined,
                flag: flag || undefined,
                search: search || undefined,
                patientId: patientIdParam || undefined,
                orderId: orderIdParam || undefined,
            }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => clinicalResultService.deleteResult(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clinical-results'] });
        },
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    const handleDelete = (result: ClinicalResult) => {
        if (deleteMutation.isPending) return;
        if (window.confirm('Delete this result? This cannot be undone.')) {
            deleteMutation.mutate(result.id);
        }
    };

    const results = data?.results ?? [];
    const pagination = data?.pagination;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Clinical Results</h1>
                    <p className="text-gray-500 mt-1">Review reported lab and imaging results.</p>
                </div>
                <Link to="/clinical-results/new">
                    <Button>
                        <Plus size={18} className="mr-2" />
                        New Result
                    </Button>
                </Link>
            </div>

            <ClinicalNav />

            <Card className="p-4">
                <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            placeholder="Search by patient, result name, or value..."
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
                                setStatus(e.target.value as ResultStatus | '');
                                setPage(1);
                            }}
                        >
                            <option value="">All statuses</option>
                            {statusOptions.map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-full lg:w-48">
                        <select
                            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                            value={flag}
                            onChange={(e) => {
                                setFlag(e.target.value as ResultFlag | '');
                                setPage(1);
                            }}
                        >
                            <option value="">All flags</option>
                            {flagOptions.map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                    <Button type="submit">Search</Button>
                </form>
                {(patientIdParam || orderIdParam) && (
                    <p className="mt-3 text-sm text-indigo-600">
                        {patientIdParam && `Filtered by patient ID: ${patientIdParam}`}
                        {patientIdParam && orderIdParam ? ' • ' : ''}
                        {orderIdParam && `Order ID: ${orderIdParam}`}
                    </p>
                )}
            </Card>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Patient</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Result</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Order</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Reported</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Flag</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        Loading results...
                                    </td>
                                </tr>
                            ) : results.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        No results found
                                    </td>
                                </tr>
                            ) : (
                                results.map((result) => (
                                    <tr key={result.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">
                                                {result.patient
                                                    ? `${result.patient.firstName} ${result.patient.lastName}`
                                                    : result.patientId}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {result.patient?.mrn || result.patientId}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            <div className="font-medium text-gray-900">{result.resultName}</div>
                                            <div className="text-xs text-gray-500">
                                                {result.value ? `${result.value}${result.unit ? ` ${result.unit}` : ''}` : '--'}
                                                {result.referenceRange ? ` · ${result.referenceRange}` : ''}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            <div className="font-medium text-gray-900">
                                                {result.order?.orderName || result.orderId}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {result.order?.orderType || '--'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {formatDateTime(result.reportedAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[result.status]}`}>
                                                {result.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${flagStyles[result.flag]}`}>
                                                {result.flag}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link to={`/clinical-results/${result.id}/edit`}>
                                                    <Button variant="outline" size="sm">
                                                        <Pencil size={16} />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(result)}
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
                            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} results
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
