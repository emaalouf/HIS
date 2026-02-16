import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { neurologyStrokeService } from '../../services/neurology-stroke.service';
import { Button, Card, Input } from '../../components/ui';
import { formatDateTime } from '../../lib/utils';
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { NeurologyStroke, StrokeType } from '../../types';
import { NeurologyNav } from './NeurologyNav';

const strokeTypeOptions: StrokeType[] = [
    'ISCHEMIC',
    'HEMORRHAGIC',
    'TIA',
];

const typeStyles: Record<StrokeType, string> = {
    ISCHEMIC: 'bg-blue-100 text-blue-700',
    HEMORRHAGIC: 'bg-red-100 text-red-700',
    TIA: 'bg-amber-100 text-amber-700',
};

export function NeurologyStrokesPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [strokeType, setStrokeType] = useState<StrokeType | ''>('');
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const limit = 10;

    const { data, isLoading } = useQuery({
        queryKey: ['neurology-strokes', page, strokeType, search],
        queryFn: () =>
            neurologyStrokeService.getStrokes({
                page,
                limit,
                strokeType: strokeType || undefined,
                search: search || undefined,
            }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => neurologyStrokeService.deleteStroke(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['neurology-strokes'] });
        },
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    const handleDelete = (stroke: NeurologyStroke) => {
        if (deleteMutation.isPending) return;
        if (window.confirm('Delete this stroke record? This cannot be undone.')) {
            deleteMutation.mutate(stroke.id);
        }
    };

    const strokes = data?.strokes ?? [];
    const pagination = data?.pagination;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Stroke Records</h1>
                    <p className="text-gray-500 mt-1">Track stroke cases and treatment details.</p>
                </div>
                <Link to="/neurology/strokes/new">
                    <Button>
                        <Plus size={18} className="mr-2" />
                        New Stroke Record
                    </Button>
                </Link>
            </div>

            <NeurologyNav />

            <Card className="p-4">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            placeholder="Search by patient or location..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="w-full md:w-48">
                        <select
                            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                            value={strokeType}
                            onChange={(e) => {
                                setStrokeType(e.target.value as StrokeType | '');
                                setPage(1);
                            }}
                        >
                            <option value="">All types</option>
                            {strokeTypeOptions.map((option) => (
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
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Onset Time</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Type</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">NIHSS</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Severity</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Loading stroke records...
                                    </td>
                                </tr>
                            ) : strokes.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No stroke records found
                                    </td>
                                </tr>
                            ) : (
                                strokes.map((stroke) => (
                                    <tr key={stroke.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">
                                                {stroke.patient
                                                    ? `${stroke.patient.firstName} ${stroke.patient.lastName}`
                                                    : stroke.patientId}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {stroke.patient?.mrn || stroke.patientId}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {formatDateTime(stroke.onsetTime)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${typeStyles[stroke.strokeType]}`}>
                                                {stroke.strokeType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {stroke.nihssScore}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {stroke.severity}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link to={`/neurology/strokes/${stroke.id}/edit`}>
                                                    <Button variant="outline" size="sm">
                                                        <Pencil size={16} />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(stroke)}
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
                            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} records
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
