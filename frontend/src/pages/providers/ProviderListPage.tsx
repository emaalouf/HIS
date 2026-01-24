import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { providerService } from '../../services/provider.service';
import { Button, Card, Input } from '../../components/ui';
import { getInitials } from '../../lib/utils';
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Provider } from '../../types';

export function ProviderListPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const limit = 10;

    const { data, isLoading } = useQuery({
        queryKey: ['providers', page, search],
        queryFn: () => providerService.getProviders({ page, limit, search }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => providerService.deleteProvider(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['providers'] });
            queryClient.invalidateQueries({ queryKey: ['appointments-meta'] });
        },
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    const handleDelete = (provider: Provider) => {
        if (deleteMutation.isPending) return;
        const label = `${provider.firstName} ${provider.lastName}`;
        if (window.confirm(`Delete provider ${label}? This cannot be undone.`)) {
            deleteMutation.mutate(provider.id);
        }
    };

    const providers = data?.providers ?? [];
    const pagination = data?.pagination;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Providers</h1>
                    <p className="text-gray-500 mt-1">Manage medical providers and their details.</p>
                </div>
                <Link to="/providers/new">
                    <Button>
                        <Plus size={18} className="mr-2" />
                        Add Provider
                    </Button>
                </Link>
            </div>

            <Card className="p-4">
                <form onSubmit={handleSearch} className="flex gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            placeholder="Search by name, specialty, or email..."
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
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Provider</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Role</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Specialty</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Contact</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Loading providers...
                                    </td>
                                </tr>
                            ) : providers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No providers found
                                    </td>
                                </tr>
                            ) : (
                                providers.map((provider) => (
                                    <tr key={provider.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                                                    {getInitials(provider.firstName, provider.lastName)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {provider.firstName} {provider.lastName}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{provider.email || '-'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{provider.role}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div>{provider.specialty || '-'}</div>
                                            {provider.department && (
                                                <div className="text-xs text-gray-500">{provider.department}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div>{provider.phone || '-'}</div>
                                            <div className="text-xs text-gray-500">{provider.email || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${provider.isActive === false
                                                    ? 'bg-gray-100 text-gray-600'
                                                    : 'bg-green-100 text-green-700'
                                                    }`}
                                            >
                                                {provider.isActive === false ? 'Inactive' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link to={`/providers/${provider.id}/edit`}>
                                                    <Button variant="outline" size="sm">
                                                        <Pencil size={16} />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(provider)}
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
                            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} providers
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
