import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { surgeryService } from '../../services/surgery.service';
import { Button, Card, Input } from '../../components/ui';
import { formatDate } from '../../lib/utils';
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import type { Surgery, SurgeryStatus, SurgeryPriority } from '../../types';

const statusStyles: Record<SurgeryStatus, string> = {
    REQUESTED: 'bg-slate-100 text-slate-700',
    SCHEDULED: 'bg-blue-100 text-blue-700',
    PRE_OP: 'bg-violet-100 text-violet-700',
    IN_PROGRESS: 'bg-amber-100 text-amber-700',
    RECOVERY: 'bg-teal-100 text-teal-700',
    COMPLETED: 'bg-emerald-100 text-emerald-700',
    CANCELLED: 'bg-rose-100 text-rose-700',
};

const priorityStyles: Record<SurgeryPriority, string> = {
    ELECTIVE: 'bg-gray-100 text-gray-700',
    URGENT: 'bg-orange-100 text-orange-700',
    EMERGENCY: 'bg-red-100 text-red-700',
};

const statusOptions: SurgeryStatus[] = [
    'REQUESTED',
    'SCHEDULED',
    'PRE_OP',
    'IN_PROGRESS',
    'RECOVERY',
    'COMPLETED',
    'CANCELLED',
];

const priorityOptions: SurgeryPriority[] = ['ELECTIVE', 'URGENT', 'EMERGENCY'];

export function SurgeriesListPage() {
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState<SurgeryStatus>();
    const [priority, setPriority] = useState<SurgeryPriority>();
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const limit = 10;
    const patientIdParam = searchParams.get('patientId') || '';

    const { data, isLoading } = useQuery({
        queryKey: ['surgeries', page, status, priority, search, patientIdParam],
        queryFn: () =>
            surgeryService.getSurgeries({
                page,
                limit,
                status: status || undefined,
                priority: priority || undefined,
                search: search || undefined,
                patientId: patientIdParam || undefined,
            }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => surgeryService.deleteSurgery(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['surgeries'] });
        },
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    const handleDelete = (surgery: Surgery) => {
        if (deleteMutation.isPending) return;
        if (window.confirm('Delete this surgery? This cannot be undone.')) {
            deleteMutation.mutate(surgery.id);
        }
    };

    const surgeries = data?.surgeries ?? [];
    const pagination = data?.pagination;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Surgeries</h1>
                    <p className="text-gray-500 mt-1">Manage surgical procedures and schedules.</p>
                </div>
                <Link to="/surgeries/new">
                    <Button>
                        <Plus size={18} className="mr-2" />
                        New Surgery
                    </Button>
                </Link>
            </div>

            <Card className="p-4">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            placeholder="Search by patient, procedure, or diagnosis..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                     <div className="w-full md:w-40">
                        <select
                            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value as SurgeryStatus);
                                setPage(1);
                            }}
                        >
                            <option value="">All statuses</option>
                            {statusOptions.map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-full md:w-40">
                        <select
                            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                            value={priority}
                            onChange={(e) => {
                                setPriority(e.target.value as SurgeryPriority);
                                setPage(1);
                            }}
                        >
                            <option value="">All priorities</option>
                            {priorityOptions.map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                    <Button type="submit">Search</Button>
                </form>
                {patientIdParam && (
                    <p className="mt-3 text-sm text-cyan-600">
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
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Procedure</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Schedule</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Priority</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Theater</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        Loading surgeries...
                                    </td>
                                </tr>
                            ) : surgeries.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        No surgeries found
                                    </td>
                                </tr>
                            ) : (
                                surgeries.map((surgery) => (
                                    <tr key={surgery.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">
                                                {surgery.patient
                                                    ? `${surgery.patient.firstName} ${surgery.patient.lastName}`
                                                    : surgery.patientId}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {surgery.patient?.mrn || surgery.patientId}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{surgery.procedureName}</div>
                                            <div className="text-xs text-gray-500 truncate max-w-[200px]">
                                                {surgery.preOpDiagnosis}
                                            </div>
                                        </td>
                                         <td className="px-6 py-4 text-sm text-gray-700">
                                            <div className="flex items-center gap-1">
                                                <Clock size={14} />
                                                {formatDate(surgery.scheduledStart)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${priorityStyles[surgery.priority]}`}>
                                                {surgery.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {surgery.theater?.name || 'Not assigned'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[surgery.status]}`}>
                                                {surgery.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link to={`/surgeries/${surgery.id}/edit`}>
                                                    <Button variant="outline" size="sm">
                                                        <Pencil size={16} />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(surgery)}
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
                            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} surgeries
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