import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dialysisStationService } from '../../services/dialysis-station.service';
import { Button, Card, Input } from '../../components/ui';
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { DialysisStation, DialysisStationStatus } from '../../types';
import { DialysisNav } from './DialysisNav';

const statusOptions: DialysisStationStatus[] = ['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'OUT_OF_SERVICE'];

const statusStyles: Record<DialysisStationStatus, string> = {
    AVAILABLE: 'bg-green-100 text-green-700',
    IN_USE: 'bg-blue-100 text-blue-700',
    MAINTENANCE: 'bg-amber-100 text-amber-700',
    OUT_OF_SERVICE: 'bg-red-100 text-red-700',
};

export function DialysisStationsPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [status, setStatus] = useState<DialysisStationStatus | ''>('');
    const limit = 10;

    const { data, isLoading } = useQuery({
        queryKey: ['dialysis-stations', page, search, status],
        queryFn: () =>
            dialysisStationService.getStations({
                page,
                limit,
                search,
                status: status || undefined,
            }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => dialysisStationService.deleteStation(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dialysis-stations'] });
        },
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    const handleDelete = (station: DialysisStation) => {
        if (deleteMutation.isPending) return;
        if (window.confirm(`Delete station "${station.name}"? This cannot be undone.`)) {
            deleteMutation.mutate(station.id);
        }
    };

    const stations = data?.stations ?? [];
    const pagination = data?.pagination;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Chairs & Machines</h1>
                    <p className="text-gray-500 mt-1">Track dialysis stations, availability, and maintenance.</p>
                </div>
                <Link to="/dialysis/stations/new">
                    <Button>
                        <Plus size={18} className="mr-2" />
                        Add Station
                    </Button>
                </Link>
            </div>

            <DialysisNav />

            <Card className="p-4">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            placeholder="Search by name, room, or machine..."
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
                                setStatus(e.target.value as DialysisStationStatus | '');
                                setPage(1);
                            }}
                        >
                            <option value="">All statuses</option>
                            {statusOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
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
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Station</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Room</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Machine</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Service</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Loading stations...
                                    </td>
                                </tr>
                            ) : stations.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No stations found
                                    </td>
                                </tr>
                            ) : (
                                stations.map((station) => (
                                    <tr key={station.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">{station.name}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{station.room || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{station.machineNumber || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[station.status]}`}>
                                                {station.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div>{station.lastServiceDate || '-'}</div>
                                            <div className="text-xs text-gray-500">Next: {station.nextServiceDate || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link to={`/dialysis/stations/${station.id}/edit`}>
                                                    <Button variant="outline" size="sm">
                                                        <Pencil size={16} />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(station)}
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
                            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} stations
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
