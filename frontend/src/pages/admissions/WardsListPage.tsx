import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { wardService } from '../../services/ward.service';
import { Button, Card, Input } from '../../components/ui';
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Ward } from '../../types';
import { AdmissionsNav } from './AdmissionsNav';

export function WardsListPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [isActive, setIsActive] = useState<'all' | 'active' | 'inactive'>('all');
    const limit = 10;

    const { data, isLoading } = useQuery({
        queryKey: ['wards', page, search, isActive],
        queryFn: () =>
            wardService.getWards({
                page,
                limit,
                search: search || undefined,
                isActive: isActive === 'all' ? undefined : isActive === 'active',
            }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => wardService.deleteWard(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wards'] });
        },
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    const handleDelete = (ward: Ward) => {
        if (deleteMutation.isPending) return;
        if (window.confirm('Delete this ward? This cannot be undone.')) {
            deleteMutation.mutate(ward.id);
        }
    };

    const wards = data?.wards ?? [];
    const pagination = data?.pagination;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Wards</h1>
                    <p className="text-gray-500 mt-1">Organize inpatient units and service lines.</p>
                </div>
                <Link to="/admissions/wards/new">
                    <Button>
                        <Plus size={18} className="mr-2" />
                        New Ward
                    </Button>
                </Link>
            </div>

            <AdmissionsNav />

            <Card className="p-4">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            placeholder="Search by ward name or notes..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="w-full md:w-48">
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
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Ward</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Department</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        Loading wards...
                                    </td>
                                </tr>
                            ) : wards.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        No wards found
                                    </td>
                                </tr>
                            ) : (
                                wards.map((ward) => (
                                    <tr key={ward.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{ward.name}</div>
                                            <div className="text-xs text-gray-500">{ward.notes || 'No notes'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {ward.department?.name || ward.departmentId || '--'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${ward.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                                                {ward.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link to={`/admissions/wards/${ward.id}/edit`}>
                                                    <Button variant="outline" size="sm">
                                                        <Pencil size={16} />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(ward)}
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
                            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} wards
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
