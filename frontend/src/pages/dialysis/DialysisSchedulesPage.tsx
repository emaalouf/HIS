import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dialysisScheduleService } from '../../services/dialysis-schedule.service';
import { Button, Card, Input } from '../../components/ui';
import { formatDateTime } from '../../lib/utils';
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { DialysisSchedule, DialysisScheduleRecurrence } from '../../types';
import { DialysisNav } from './DialysisNav';

const recurrenceOptions: DialysisScheduleRecurrence[] = ['NONE', 'DAILY', 'WEEKLY', 'MONTHLY'];

export function DialysisSchedulesPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [recurrence, setRecurrence] = useState<DialysisScheduleRecurrence | ''>('');
    const limit = 10;

    const { data, isLoading } = useQuery({
        queryKey: ['dialysis-schedules', page, search, recurrence],
        queryFn: () =>
            dialysisScheduleService.getSchedules({
                page,
                limit,
                search,
                recurrence: recurrence || undefined,
            }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => dialysisScheduleService.deleteSchedule(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dialysis-schedules'] });
        },
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    const handleDelete = (schedule: DialysisSchedule) => {
        if (deleteMutation.isPending) return;
        if (window.confirm('Delete this schedule? This cannot be undone.')) {
            deleteMutation.mutate(schedule.id);
        }
    };

    const schedules = data?.schedules ?? [];
    const pagination = data?.pagination;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dialysis Schedules</h1>
                    <p className="text-gray-500 mt-1">Plan recurring sessions and chair assignments.</p>
                </div>
                <Link to="/dialysis/schedules/new">
                    <Button>
                        <Plus size={18} className="mr-2" />
                        New Schedule
                    </Button>
                </Link>
            </div>

            <DialysisNav />

            <Card className="p-4">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            placeholder="Search by patient or provider..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="w-full md:w-48">
                        <select
                            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                            value={recurrence}
                            onChange={(e) => {
                                setRecurrence(e.target.value as DialysisScheduleRecurrence | '');
                                setPage(1);
                            }}
                        >
                            <option value="">All recurrence</option>
                            {recurrenceOptions.map((option) => (
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
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Patient</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Station</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Schedule</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Recurrence</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Loading schedules...
                                    </td>
                                </tr>
                            ) : schedules.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No schedules found
                                    </td>
                                </tr>
                            ) : (
                                schedules.map((schedule) => (
                                    <tr key={schedule.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">
                                                {schedule.patient
                                                    ? `${schedule.patient.firstName} ${schedule.patient.lastName}`
                                                    : schedule.patientId}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {schedule.patient?.mrn || schedule.patientId}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            <div>{schedule.station?.name || schedule.stationId || '-'}</div>
                                            <div className="text-xs text-gray-500">{schedule.station?.room || ''}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            <div>{formatDateTime(schedule.startTime)}</div>
                                            <div className="text-xs text-gray-500">{schedule.durationMinutes} min</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            <div>{schedule.recurrence}</div>
                                            <div className="text-xs text-gray-500">
                                                {schedule.daysOfWeek?.length ? schedule.daysOfWeek.join(', ') : 'Single'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${schedule.isActive === false
                                                    ? 'bg-gray-100 text-gray-600'
                                                    : 'bg-green-100 text-green-700'
                                                    }`}
                                            >
                                                {schedule.isActive === false ? 'Inactive' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link to={`/dialysis/schedules/${schedule.id}/edit`}>
                                                    <Button variant="outline" size="sm">
                                                        <Pencil size={16} />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(schedule)}
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
                            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} schedules
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
