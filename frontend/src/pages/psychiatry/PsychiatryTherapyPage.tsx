import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { psychiatryTherapyService } from '../../services/psychiatry-therapy.service';
import { Button, Card, Input } from '../../components/ui';
import { formatDateTime } from '../../lib/utils';
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { PsychiatryTherapy, TherapyType } from '../../types';
import { PsychiatryNav } from './PsychiatryNav';

const therapyTypeOptions: TherapyType[] = [
    'INDIVIDUAL',
    'GROUP',
    'FAMILY',
    'COUPLES',
    'COGNITIVE_BEHAVIORAL',
    'DIALECTICAL_BEHAVIORAL',
    'PSYCHODYNAMIC',
    'SUPPORTIVE',
    'EXPOSURE',
];

const therapyTypeLabels: Record<TherapyType, string> = {
    INDIVIDUAL: 'Individual',
    GROUP: 'Group',
    FAMILY: 'Family',
    COUPLES: 'Couples',
    COGNITIVE_BEHAVIORAL: 'CBT',
    DIALECTICAL_BEHAVIORAL: 'DBT',
    PSYCHODYNAMIC: 'Psychodynamic',
    SUPPORTIVE: 'Supportive',
    EXPOSURE: 'Exposure',
};

export function PsychiatryTherapyPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [therapyType, setTherapyType] = useState<TherapyType | ''>('');
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const limit = 10;

    const { data, isLoading } = useQuery({
        queryKey: ['psychiatry-therapy', page, therapyType, search],
        queryFn: () =>
            psychiatryTherapyService.getTherapies({
                page,
                limit,
                therapyType: therapyType || undefined,
                search: search || undefined,
            }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => psychiatryTherapyService.deleteTherapy(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['psychiatry-therapy'] });
        },
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    const handleDelete = (therapy: PsychiatryTherapy) => {
        if (deleteMutation.isPending) return;
        if (window.confirm('Delete this therapy session? This cannot be undone.')) {
            deleteMutation.mutate(therapy.id);
        }
    };

    const therapies = data?.therapies ?? [];
    const pagination = data?.pagination;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Psychiatry Therapy Sessions</h1>
                    <p className="text-gray-500 mt-1">Track therapy sessions and progress notes.</p>
                </div>
                <Link to="/psychiatry/therapy/new">
                    <Button>
                        <Plus size={18} className="mr-2" />
                        New Session
                    </Button>
                </Link>
            </div>

            <PsychiatryNav />

            <Card className="p-4">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            placeholder="Search by patient or interventions..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="w-full md:w-48">
                        <select
                            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                            value={therapyType}
                            onChange={(e) => {
                                setTherapyType(e.target.value as TherapyType | '');
                                setPage(1);
                            }}
                        >
                            <option value="">All types</option>
                            {therapyTypeOptions.map((option) => (
                                <option key={option} value={option}>{therapyTypeLabels[option]}</option>
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
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Session Date</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Type</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Session #</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Duration</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        Loading therapy sessions...
                                    </td>
                                </tr>
                            ) : therapies.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        No therapy sessions found
                                    </td>
                                </tr>
                            ) : (
                                therapies.map((therapy) => (
                                    <tr key={therapy.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">
                                                {therapy.patient
                                                    ? `${therapy.patient.firstName} ${therapy.patient.lastName}`
                                                    : therapy.patientId}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {therapy.patient?.mrn || therapy.patientId}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {formatDateTime(therapy.sessionDate)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {therapyTypeLabels[therapy.therapyType]}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            #{therapy.sessionNumber}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {therapy.durationMinutes ? `${therapy.durationMinutes} min` : '—'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {therapy.noShow ? (
                                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
                                                    No Show
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                                                    Completed
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link to={`/psychiatry/therapy/${therapy.id}/edit`}>
                                                    <Button variant="outline" size="sm">
                                                        <Pencil size={16} />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(therapy)}
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
                            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} sessions
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
