import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { operatingTheaterService } from '../../services/operating-theater.service';
import { Button, Card, Input } from '../../components/ui';
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import type { OperatingTheater } from '../../types';

export function OperatingTheatersListPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [status, setStatus] = useState('');
    const limit = 10;

    const { data, isLoading } = useQuery({
        queryKey: ['operatingTheaters', page, search, status],
        queryFn: () =>
            operatingTheaterService.getOperatingTheaters({
                page,
                limit,
                search: search || undefined,
                status: status || undefined,
            }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => operatingTheaterService.deleteOperatingTheater(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['operatingTheaters'] });
        },
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    const handleDelete = (theater: OperatingTheater) => {
        if (deleteMutation.isPending) return;
        if (window.confirm(`Delete operating theater "${theater.name}"? This cannot be undone.`)) {
            deleteMutation.mutate(theater.id);
        }
    };

    const theaters = data?.theaters ?? [];
    const pagination = data?.pagination;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Operating Theaters</h1>
                    <p className="text-gray-500 mt-1">Manage operating room facilities and equipment.</p>
                </div>
                <Link to="/operating-theaters/new">
                    <Button>
                        <Plus size={18} className="mr-2" />
                        New Theater
                    </Button>
                </Link>
            </div>

            <Card className="p-4">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            placeholder="Search by name or location..."
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
                                setStatus(e.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="">All statuses</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
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
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Name</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Location</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Surgeries</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        Loading operating theaters...
                                    </td>
                                </tr>
                            ) : theaters.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No operating theaters found
                                    </td>
                                </tr>
                            ) : (
                                theaters.map((theater) => (
                                    <tr key={theater.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{theater.name}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {theater.location ? (
                                                <div className="flex items-center gap-1">
                                                    <MapPin size={14} />
                                                    {theater.location}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                    theater.status === 'ACTIVE'
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-slate-100 text-slate-700'
                                                }`}
                                            >
                                                {theater.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {theater.surgeries?.length || 0}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link to={`/operating-theaters/${theater.id}/edit`}>
                                                    <Button variant="outline" size="sm">
                                                        <Pencil size={16} />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(theater)}
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
                            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of{' '}
                            {pagination.total} theaters
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
