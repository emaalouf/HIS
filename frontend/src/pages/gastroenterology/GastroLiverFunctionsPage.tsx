import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gastroLiverFunctionService } from '../../services/gastro-liver-function.service';
import { Button, Card, Input } from '../../components/ui';
import { formatDateTime } from '../../lib/utils';
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { GastroLiverFunction } from '../../types';
import { GastroNav } from './GastroNav';

export function GastroLiverFunctionsPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const limit = 10;

    const { data, isLoading } = useQuery({
        queryKey: ['gastro-liver-functions', page, search],
        queryFn: () =>
            gastroLiverFunctionService.getLiverFunctions({
                page,
                limit,
                search: search || undefined,
            }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => gastroLiverFunctionService.deleteLiverFunction(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gastro-liver-functions'] });
        },
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    const handleDelete = (liverFunction: GastroLiverFunction) => {
        if (deleteMutation.isPending) return;
        if (window.confirm('Delete this liver function test? This cannot be undone.')) {
            deleteMutation.mutate(liverFunction.id);
        }
    };

    const liverFunctions = data?.liverFunctions ?? [];
    const pagination = data?.pagination;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Liver Function Tests</h1>
                    <p className="text-gray-500 mt-1">Track liver enzyme levels and liver health markers.</p>
                </div>
                <Link to="/gastroenterology/liver-function/new">
                    <Button>
                        <Plus size={18} className="mr-2" />
                        New Liver Function Test
                    </Button>
                </Link>
            </div>

            <GastroNav />

            <Card className="p-4">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            placeholder="Search by patient or diagnosis..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="pl-10"
                        />
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
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Test Date</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">ALT</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">AST</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Bilirubin</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Diagnosis</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        Loading liver function tests...
                                    </td>
                                </tr>
                            ) : liverFunctions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        No liver function tests found
                                    </td>
                                </tr>
                            ) : (
                                liverFunctions.map((liverFunction) => (
                                    <tr key={liverFunction.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">
                                                {liverFunction.patient
                                                    ? `${liverFunction.patient.firstName} ${liverFunction.patient.lastName}`
                                                    : liverFunction.patientId}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {liverFunction.patient?.mrn || liverFunction.patientId}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {formatDateTime(liverFunction.testDate)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {liverFunction.alt ?? '—'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {liverFunction.ast ?? '—'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {liverFunction.totalBilirubin ?? '—'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {liverFunction.diagnosis || '—'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link to={`/gastroenterology/liver-function/${liverFunction.id}/edit`}>
                                                    <Button variant="outline" size="sm">
                                                        <Pencil size={16} />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(liverFunction)}
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
                            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} tests
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
