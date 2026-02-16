import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { neurologyEmgService } from '../../services/neurology-emg.service';
import { Button, Card, Input } from '../../components/ui';
import { formatDateTime } from '../../lib/utils';
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { NeurologyEmg, NeurologyTestStatus } from '../../types';
import { NeurologyNav } from './NeurologyNav';

const statusOptions: NeurologyTestStatus[] = [
    'ORDERED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
];

const statusStyles: Record<NeurologyTestStatus, string> = {
    ORDERED: 'bg-slate-100 text-slate-700',
    IN_PROGRESS: 'bg-amber-100 text-amber-700',
    COMPLETED: 'bg-emerald-100 text-emerald-700',
    CANCELLED: 'bg-rose-100 text-rose-700',
};

export function NeurologyEmgsPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState<NeurologyTestStatus | ''>('');
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const limit = 10;

    const { data, isLoading } = useQuery({
        queryKey: ['neurology-emgs', page, status, search],
        queryFn: () =>
            neurologyEmgService.getEmgs({
                page,
                limit,
                status: status || undefined,
                search: search || undefined,
            }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => neurologyEmgService.deleteEmg(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['neurology-emgs'] });
        },
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    const handleDelete = (emg: NeurologyEmg) => {
        if (deleteMutation.isPending) return;
        if (window.confirm('Delete this EMG record? This cannot be undone.')) {
            deleteMutation.mutate(emg.id);
        }
    };

    const emgs = data?.emgs ?? [];
    const pagination = data?.pagination;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">EMG Studies</h1>
                    <p className="text-gray-500 mt-1">Track EMG recordings and interpretations.</p>
                </div>
                <Link to="/neurology/emgs/new">
                    <Button>
                        <Plus size={18} className="mr-2" />
                        New EMG
                    </Button>
                </Link>
            </div>

            <NeurologyNav />

            <Card className="p-4">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            placeholder="Search by patient, indication, or findings..."
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
                                setStatus(e.target.value as NeurologyTestStatus | '');
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
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Performed</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Indication</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Muscles Tested</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Loading EMGs...
                                    </td>
                                </tr>
                            ) : emgs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No EMGs found
                                    </td>
                                </tr>
                            ) : (
                                emgs.map((emg) => (
                                    <tr key={emg.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">
                                                {emg.patient
                                                    ? `${emg.patient.firstName} ${emg.patient.lastName}`
                                                    : emg.patientId}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {emg.patient?.mrn || emg.patientId}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {formatDateTime(emg.performedAt)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {emg.indication || '—'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {emg.musclesTested || '—'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[emg.status]}`}>
                                                {emg.status.split('_').join(' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link to={`/neurology/emgs/${emg.id}/edit`}>
                                                    <Button variant="outline" size="sm">
                                                        <Pencil size={16} />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(emg)}
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
                            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} EMGs
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                <ChevronLeft size={16} />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
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
