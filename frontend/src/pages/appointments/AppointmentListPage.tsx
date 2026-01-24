import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { appointmentService } from '../../services/appointment.service';
import type { Appointment, AppointmentStatus } from '../../types';
import { Button, Card, Input } from '../../components/ui';
import { Plus, RefreshCcw } from 'lucide-react';

const statusStyles: Record<AppointmentStatus, string> = {
    SCHEDULED: 'bg-slate-100 text-slate-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    CHECKED_IN: 'bg-amber-100 text-amber-700',
    IN_PROGRESS: 'bg-indigo-100 text-indigo-700',
    COMPLETED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
    NO_SHOW: 'bg-gray-200 text-gray-700',
};

const statusOptions: AppointmentStatus[] = [
    'SCHEDULED',
    'CONFIRMED',
    'CHECKED_IN',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW',
];

const formatDateTimeLocal = (value: Date) => {
    const local = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
};

const formatDisplay = (value: string) =>
    new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

export function AppointmentListPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState<AppointmentStatus | ''>('');
    const [providerId, setProviderId] = useState('');
    const [search, setSearch] = useState('');
    const [dateRange, setDateRange] = useState(() => {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setHours(23, 59, 59, 999);
        return {
            startDate: formatDateTimeLocal(start),
            endDate: formatDateTimeLocal(end),
        };
    });

    const defaultStart = useMemo(() => {
        const start = new Date();
        start.setMinutes(start.getMinutes() + 30);
        return formatDateTimeLocal(start);
    }, []);

    const defaultEnd = useMemo(() => {
        const end = new Date();
        end.setMinutes(end.getMinutes() + 60);
        return formatDateTimeLocal(end);
    }, []);

    const [form, setForm] = useState({
        patientId: '',
        providerId: '',
        visitTypeId: '',
        locationId: '',
        startTime: defaultStart,
        endTime: defaultEnd,
        reason: '',
        notes: '',
    });

    const { data: meta } = useQuery({
        queryKey: ['appointments-meta'],
        queryFn: () => appointmentService.getMeta(),
    });

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['appointments', page, status, providerId, search, dateRange.startDate, dateRange.endDate],
        queryFn: () =>
            appointmentService.getAppointments({
                page,
                limit: 10,
                status: status || undefined,
                providerId: providerId || undefined,
                search: search || undefined,
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
            }),
    });

    const createMutation = useMutation({
        mutationFn: (payload: typeof form) =>
            appointmentService.createAppointment({
                ...payload,
                visitTypeId: payload.visitTypeId || null,
                locationId: payload.locationId || null,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            setForm((prev) => ({
                ...prev,
                reason: '',
                notes: '',
                patientId: '',
                providerId: '',
            }));
        },
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, nextStatus }: { id: string; nextStatus: AppointmentStatus }) =>
            appointmentService.updateStatus(id, nextStatus),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        },
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.patientId || !form.providerId) return;
        createMutation.mutate(form);
    };

    const handleStatusChange = (id: string, nextStatus: AppointmentStatus) => {
        statusMutation.mutate({ id, nextStatus });
    };

    const appointments = data?.appointments ?? [];
    const pagination = data?.pagination;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
                    <p className="text-gray-500 mt-1">
                        Schedule, track, and manage patient visits with providers.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {isFetching && <span className="text-sm text-gray-500">Refreshing…</span>}
                    <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ['appointments'] })}>
                        <RefreshCcw size={16} className="mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Filters */}
                <Card className="p-4 lg:col-span-2">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label className="text-sm text-gray-600 mb-1 block">Search</label>
                            <Input
                                placeholder="Search by patient name, MRN, or phone"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-sm text-gray-600 mb-1 block">Provider</label>
                            <select
                                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                                value={providerId}
                                onChange={(e) => {
                                    setProviderId(e.target.value);
                                    setPage(1);
                                }}
                            >
                                <option value="">All providers</option>
                                {meta?.providers.map((provider) => (
                                    <option key={provider.id} value={provider.id}>
                                        {provider.firstName} {provider.lastName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-gray-600 mb-1 block">Status</label>
                            <select
                                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                                value={status}
                                onChange={(e) => {
                                    setStatus(e.target.value as AppointmentStatus | '');
                                    setPage(1);
                                }}
                            >
                                <option value="">All statuses</option>
                                {statusOptions.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-600 mb-1 block">Start</label>
                            <Input
                                type="datetime-local"
                                value={dateRange.startDate}
                                onChange={(e) => {
                                    setDateRange((prev) => ({ ...prev, startDate: e.target.value }));
                                    setPage(1);
                                }}
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600 mb-1 block">End</label>
                            <Input
                                type="datetime-local"
                                value={dateRange.endDate}
                                onChange={(e) => {
                                    setDateRange((prev) => ({ ...prev, endDate: e.target.value }));
                                    setPage(1);
                                }}
                            />
                        </div>
                    </div>
                </Card>

                {/* New appointment */}
                <Card className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <Plus size={16} />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">Create appointment</p>
                            <p className="text-sm text-gray-500">Capture visit details and assign a provider.</p>
                        </div>
                    </div>
                    <form className="space-y-3" onSubmit={handleCreate}>
                        <div>
                            <label className="text-sm text-gray-600 mb-1 block">Patient ID</label>
                            <Input
                                placeholder="Paste patient ID"
                                value={form.patientId}
                                onChange={(e) => setForm((prev) => ({ ...prev, patientId: e.target.value }))}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600 mb-1 block">Provider</label>
                            <select
                                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                                value={form.providerId}
                                onChange={(e) => setForm((prev) => ({ ...prev, providerId: e.target.value }))}
                                required
                            >
                                <option value="">Select a provider</option>
                                {meta?.providers.map((provider) => (
                                    <option key={provider.id} value={provider.id}>
                                        Dr. {provider.firstName} {provider.lastName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-sm text-gray-600 mb-1 block">Visit type</label>
                                <select
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                                    value={form.visitTypeId}
                                    onChange={(e) => setForm((prev) => ({ ...prev, visitTypeId: e.target.value }))}
                                >
                                    <option value="">Select</option>
                                    {meta?.visitTypes.map((vt) => (
                                        <option key={vt.id} value={vt.id}>
                                            {vt.name} ({vt.durationMinutes}m)
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 mb-1 block">Location</label>
                                <select
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                                    value={form.locationId}
                                    onChange={(e) => setForm((prev) => ({ ...prev, locationId: e.target.value }))}
                                >
                                    <option value="">Select</option>
                                    {meta?.locations.map((loc) => (
                                        <option key={loc.id} value={loc.id}>
                                            {loc.name} {loc.type ? `(${loc.type})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-sm text-gray-600 mb-1 block">Start</label>
                                <Input
                                    type="datetime-local"
                                    value={form.startTime}
                                    onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 mb-1 block">End</label>
                                <Input
                                    type="datetime-local"
                                    value={form.endTime}
                                    onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm text-gray-600 mb-1 block">Reason</label>
                            <Input
                                placeholder="Reason for visit"
                                value={form.reason}
                                onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600 mb-1 block">Notes</label>
                            <textarea
                                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                                rows={2}
                                placeholder="Optional notes"
                                value={form.notes}
                                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                            />
                        </div>
                        <Button type="submit" disabled={createMutation.isPending}>
                            {createMutation.isPending ? 'Saving...' : 'Create appointment'}
                        </Button>
                    </form>
                </Card>
            </div>

            {/* Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Patient</th>
                                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Provider</th>
                                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Visit</th>
                                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">When</th>
                                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Status</th>
                                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                        Loading appointments...
                                    </td>
                                </tr>
                            ) : appointments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                        No appointments found for this range.
                                    </td>
                                </tr>
                            ) : (
                                appointments.map((appt: Appointment) => (
                                    <tr key={appt.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            <div className="font-semibold">
                                                {appt.patient
                                                    ? `${appt.patient.firstName} ${appt.patient.lastName}`
                                                    : appt.patientId}
                                            </div>
                                            <div className="text-xs text-gray-500">{appt.patient?.mrn}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {appt.provider
                                                ? `Dr. ${appt.provider.firstName} ${appt.provider.lastName}`
                                                : appt.providerId}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            <div>{appt.visitType?.name || 'General'}</div>
                                            {appt.location && (
                                                <div className="text-xs text-gray-500">
                                                    {appt.location.name} {appt.location.type ? `• ${appt.location.type}` : ''}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {formatDisplay(appt.startTime)}
                                            <div className="text-xs text-gray-500">{formatDisplay(appt.endTime)}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[appt.status]}`}>
                                                {appt.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                className="text-sm border border-gray-200 rounded-md px-2 py-1"
                                                value={appt.status}
                                                onChange={(e) => handleStatusChange(appt.id, e.target.value as AppointmentStatus)}
                                                disabled={statusMutation.isPending}
                                            >
                                                {statusOptions.map((opt) => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
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
                            Showing {((page - 1) * pagination.limit) + 1}-
                            {Math.min(page * pagination.limit, pagination.total)} of {pagination.total}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                            >
                                Prev
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === pagination.totalPages}
                                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
