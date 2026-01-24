import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dialysisScheduleService } from '../../services/dialysis-schedule.service';
import { dialysisStationService } from '../../services/dialysis-station.service';
import { patientService } from '../../services/patient.service';
import { providerService } from '../../services/provider.service';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, SearchableSelect } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import type { CreateDialysisScheduleRequest, DialysisScheduleRecurrence } from '../../types';
import type { SelectOption } from '../../components/ui/SearchableSelect';
import { DialysisNav } from './DialysisNav';

const recurrenceOptions: DialysisScheduleRecurrence[] = ['NONE', 'DAILY', 'WEEKLY', 'MONTHLY'];
const daysOfWeekOptions = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const formatDateTimeLocal = (value: Date) => {
    const local = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
};

type ScheduleFormState = {
    patientId: string;
    providerId: string;
    stationId: string;
    startTime: string;
    durationMinutes: string;
    recurrence: DialysisScheduleRecurrence;
    daysOfWeek: string[];
    endDate: string;
    isActive: boolean;
    notes: string;
};

export function DialysisScheduleFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const isEditMode = Boolean(id);
    const [patientInput, setPatientInput] = useState('');
    const [providerInput, setProviderInput] = useState('');

    const defaultStart = useMemo(() => {
        const start = new Date();
        start.setMinutes(start.getMinutes() + 30);
        return formatDateTimeLocal(start);
    }, []);

    const [formData, setFormData] = useState<ScheduleFormState>({
        patientId: '',
        providerId: '',
        stationId: '',
        startTime: defaultStart,
        durationMinutes: '240',
        recurrence: 'NONE',
        daysOfWeek: [],
        endDate: '',
        isActive: true,
        notes: '',
    });

    const { data: schedule, isLoading } = useQuery({
        queryKey: ['dialysis-schedule', id],
        queryFn: () => dialysisScheduleService.getSchedule(id!),
        enabled: isEditMode,
    });

    const patientSearch = patientInput.trim();
    const providerSearch = providerInput.trim();

    const { data: patientsData, isLoading: isPatientsLoading } = useQuery({
        queryKey: ['patients', 'dialysis-schedule', patientSearch],
        queryFn: () =>
            patientService.getPatients({
                page: 1,
                limit: 10,
                search: patientSearch || undefined,
                sortBy: patientSearch ? undefined : 'createdAt',
                sortOrder: patientSearch ? undefined : 'desc',
            }),
    });

    const { data: providersData, isLoading: isProvidersLoading } = useQuery({
        queryKey: ['providers', 'dialysis-schedule', providerSearch],
        queryFn: () =>
            providerService.getProviders({
                page: 1,
                limit: 10,
                search: providerSearch || undefined,
                sortBy: providerSearch ? undefined : 'createdAt',
                sortOrder: providerSearch ? undefined : 'desc',
            }),
    });

    const { data: stationsData } = useQuery({
        queryKey: ['dialysis-stations', 'dialysis-schedule'],
        queryFn: () => dialysisStationService.getStations({ page: 1, limit: 200 }),
    });

    useEffect(() => {
        if (!schedule) return;
        setFormData({
            patientId: schedule.patientId,
            providerId: schedule.providerId || '',
            stationId: schedule.stationId || '',
            startTime: formatDateTimeLocal(new Date(schedule.startTime)),
            durationMinutes: schedule.durationMinutes.toString(),
            recurrence: schedule.recurrence,
            daysOfWeek: schedule.daysOfWeek || [],
            endDate: schedule.endDate || '',
            isActive: schedule.isActive ?? true,
            notes: schedule.notes || '',
        });
        if (schedule.patient) {
            setPatientInput(`${schedule.patient.firstName} ${schedule.patient.lastName}`);
        } else {
            setPatientInput(schedule.patientId);
        }
        if (schedule.provider) {
            const prefix = schedule.provider.role === 'DOCTOR' ? 'Dr. ' : '';
            setProviderInput(`${prefix}${schedule.provider.firstName} ${schedule.provider.lastName}`);
        } else if (schedule.providerId) {
            setProviderInput(schedule.providerId);
        }
    }, [schedule]);

    const createMutation = useMutation({
        mutationFn: (payload: CreateDialysisScheduleRequest) => dialysisScheduleService.createSchedule(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dialysis-schedules'] });
            navigate('/dialysis/schedules');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (payload: CreateDialysisScheduleRequest) => dialysisScheduleService.updateSchedule(id!, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dialysis-schedules'] });
            queryClient.invalidateQueries({ queryKey: ['dialysis-schedule', id] });
            navigate('/dialysis/schedules');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const toNumber = (value: string) => {
        const trimmed = value.trim();
        if (!trimmed) return undefined;
        const num = Number(trimmed);
        return Number.isNaN(num) ? undefined : num;
    };

    const handleToggleDay = (day: string) => {
        setFormData((prev) => {
            const exists = prev.daysOfWeek.includes(day);
            return {
                ...prev,
                daysOfWeek: exists
                    ? prev.daysOfWeek.filter((item) => item !== day)
                    : [...prev.daysOfWeek, day],
            };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.patientId) {
            setError('Please select a patient.');
            return;
        }

        const payload: CreateDialysisScheduleRequest = {
            patientId: formData.patientId,
            providerId: formData.providerId || undefined,
            stationId: formData.stationId || undefined,
            startTime: formData.startTime,
            durationMinutes: toNumber(formData.durationMinutes) || 0,
            recurrence: formData.recurrence,
            daysOfWeek: formData.recurrence === 'WEEKLY' ? formData.daysOfWeek : [],
            endDate: formData.endDate || undefined,
            isActive: formData.isActive,
            notes: formData.notes || undefined,
        };

        if (isEditMode) {
            updateMutation.mutate(payload);
        } else {
            createMutation.mutate(payload);
        }
    };

    if (isEditMode && isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (isEditMode && !schedule) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Schedule not found</p>
                <Link to="/dialysis/schedules" className="text-blue-600 hover:underline mt-2 inline-block">
                    Back to schedules
                </Link>
            </div>
        );
    }

    const patients = patientsData?.patients ?? [];
    const patientOptions: SelectOption[] = patients.map((patient) => ({
        id: patient.id,
        label: `${patient.firstName} ${patient.lastName}`,
        subLabel: `MRN ${patient.mrn}${patient.phone ? ` • ${patient.phone}` : ''}`,
    }));

    const providers = providersData?.providers ?? [];
    const providerOptions: SelectOption[] = providers.map((provider) => {
        const prefix = provider.role === 'DOCTOR' ? 'Dr. ' : '';
        const secondary = [provider.specialty, provider.department].filter(Boolean).join(' • ') || provider.role;
        return {
            id: provider.id,
            label: `${prefix}${provider.firstName} ${provider.lastName}`,
            subLabel: secondary,
        };
    });

    const stations = stationsData?.stations ?? [];
    const isSaving = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6 lg:pl-0">
            <div className="flex items-center gap-4 pt-2 lg:pt-0">
                <Link to="/dialysis/schedules">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft size={18} className="mr-2" />
                        Back
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEditMode ? 'Edit Schedule' : 'New Schedule'}
                </h1>
            </div>

            <DialysisNav />

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                        {error}
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Schedule Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SearchableSelect
                                label="Patient *"
                                placeholder="Search patients..."
                                value={patientInput}
                                required
                                options={patientOptions}
                                selectedId={formData.patientId}
                                isLoading={isPatientsLoading}
                                onInputChange={(value) => {
                                    setPatientInput(value);
                                    setFormData((prev) => ({ ...prev, patientId: '' }));
                                }}
                                onSelect={(option) => {
                                    setPatientInput(option.label);
                                    setFormData((prev) => ({ ...prev, patientId: option.id }));
                                }}
                            />
                            <SearchableSelect
                                label="Provider"
                                placeholder="Search providers..."
                                value={providerInput}
                                options={providerOptions}
                                selectedId={formData.providerId}
                                isLoading={isProvidersLoading}
                                onInputChange={(value) => {
                                    setProviderInput(value);
                                    setFormData((prev) => ({ ...prev, providerId: '' }));
                                }}
                                onSelect={(option) => {
                                    setProviderInput(option.label);
                                    setFormData((prev) => ({ ...prev, providerId: option.id }));
                                }}
                            />
                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Station</label>
                                <select
                                    name="stationId"
                                    value={formData.stationId}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, stationId: e.target.value }))}
                                    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select a station</option>
                                    {stations.map((station) => (
                                        <option key={station.id} value={station.id}>
                                            {station.name}{station.room ? ` (${station.room})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <Input
                                label="Start Time *"
                                type="datetime-local"
                                name="startTime"
                                value={formData.startTime}
                                onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
                                required
                            />
                            <Input
                                label="Duration (min) *"
                                type="number"
                                step="1"
                                name="durationMinutes"
                                value={formData.durationMinutes}
                                onChange={(e) => setFormData((prev) => ({ ...prev, durationMinutes: e.target.value }))}
                                required
                            />
                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Recurrence</label>
                                <select
                                    name="recurrence"
                                    value={formData.recurrence}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, recurrence: e.target.value as DialysisScheduleRecurrence }))}
                                    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {recurrenceOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <Input
                                label="End Date"
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                            />
                        </div>
                        {formData.recurrence === 'WEEKLY' && (
                            <div className="mt-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">Days of Week</p>
                                <div className="flex flex-wrap gap-3">
                                    {daysOfWeekOptions.map((day) => (
                                        <label key={day} className="flex items-center gap-2 text-sm text-gray-700">
                                            <input
                                                type="checkbox"
                                                checked={formData.daysOfWeek.includes(day)}
                                                onChange={() => handleToggleDay(day)}
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            {day}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            Active schedule
                        </label>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <textarea
                            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                            rows={3}
                            placeholder="Optional notes"
                            value={formData.notes}
                            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" size="lg" isLoading={isSaving}>
                        <Save size={18} className="mr-2" />
                        {isEditMode ? 'Update Schedule' : 'Save Schedule'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
