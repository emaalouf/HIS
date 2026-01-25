import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bedService } from '../../services/bed.service';
import { Button, Card, Input } from '../../components/ui';
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Bed, BedStatus } from '../../types';
import { AdmissionsNav } from './AdmissionsNav';

const statusStyles: Record<BedStatus, string> = {
    AVAILABLE: 'bg-emerald-100 text-emerald-700',
    OCCUPIED: 'bg-amber-100 text-amber-700',
    CLEANING: 'bg-sky-100 text-sky-700',
    MAINTENANCE: 'bg-rose-100 text-rose-700',
};

const statusOptions: BedStatus[] = [
    'AVAILABLE',
    'OCCUPIED',
    'CLEANING',
    'MAINTENANCE',
];

export function BedsListPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [status, setStatus] = useState<BedStatus | ''>('');
    const [isActive, setIsActive] = useState<'all' | 'active' | 'inactive'>('all');
    const limit = 10;

    const { data, isLoading } = useQuery({
        queryKey: ['beds', page, search, status, isActive],
        queryFn: () =>
            bedService.getBeds({
                page,
                limit,
                search: search || undefined,
                status: status || undefined,
                isActive: isActive === 'all' ? undefined : isActive === 'active',
            }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => bedService.deleteBed(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['beds'] });
        },
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    const handleDelete = (bed: Bed) => {
        if (deleteMutation.isPending) return;
        if (window.confirm('Delete this bed? This cannot be undone.')) {
            deleteMutation.mutate(bed.id);
        }
    };

    const beds = data?.beds ?? [];
    const pagination = data?.pagination;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Beds</h1>
                    <p className="text-gray-500 mt-1">Track bed availability and room assignments.</p>
                </div>
                <Link to="/admissions/beds/new">
                    <Button>
                        <Plus size={18} className="mr-2" />
                        New Bed
                    </Button>
                </Link>
            </div>

            <AdmissionsNav />

            <Card className="p-4">
                <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            placeholder="Search by bed label, room, or notes..."
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
                                setStatus(e.target.value as BedStatus | '');
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
                            value={isActive}
                            onChange={(e) => {
                                setIsActive(e.target.value as 'all' | 'active' | 'inactive');
                                setPage(1);
                            }}
                        >
                            <option value="all">All statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
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
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Bed</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Ward</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Active</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        Loading beds...
                                    </td>
                                </tr>
                            ) : beds.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No beds found
                                    </td>
                                </tr>
                            ) : (
                                beds.map((bed) => (
                                    <tr key={bed.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{bed.bedLabel}</div>
                                            <div className="text-xs text-gray-500">
                                                {bed.roomNumber ? `Room ${bed.roomNumber}` : 'No room number'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {bed.ward?.name || bed.wardId}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[bed.status]}`}>
                                                {bed.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${bed.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                                                {bed.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link to={`/admissions/beds/${bed.id}/edit`}>
                                                    <Button variant="outline" size="sm">
                                                        <Pencil size={16} />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(bed)}
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
                            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} beds
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
