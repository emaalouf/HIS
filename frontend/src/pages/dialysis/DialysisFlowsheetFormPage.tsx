import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dialysisFlowsheetService } from '../../services/dialysis-flowsheet.service';
import { dialysisService } from '../../services/dialysis.service';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, SearchableSelect } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import type { CreateDialysisFlowsheetEntryRequest } from '../../types';
import type { SelectOption } from '../../components/ui/SearchableSelect';
import { formatDateTime } from '../../lib/utils';
import { DialysisNav } from './DialysisNav';

type FlowsheetFormState = {
    sessionId: string;
    recordedAt: string;
    bpSystolic: string;
    bpDiastolic: string;
    heartRate: string;
    temperature: string;
    oxygenSaturation: string;
    bloodFlowRate: string;
    dialysateFlowRate: string;
    ultrafiltrationVolume: string;
    arterialPressure: string;
    venousPressure: string;
    transmembranePressure: string;
    alarms: string;
    notes: string;
};

const formatDateTimeLocal = (value: Date) => {
    const local = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
};

export function DialysisFlowsheetFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const isEditMode = Boolean(id);
    const [sessionInput, setSessionInput] = useState('');

    const defaultRecordedAt = useMemo(() => formatDateTimeLocal(new Date()), []);

    const [formData, setFormData] = useState<FlowsheetFormState>({
        sessionId: '',
        recordedAt: defaultRecordedAt,
        bpSystolic: '',
        bpDiastolic: '',
        heartRate: '',
        temperature: '',
        oxygenSaturation: '',
        bloodFlowRate: '',
        dialysateFlowRate: '',
        ultrafiltrationVolume: '',
        arterialPressure: '',
        venousPressure: '',
        transmembranePressure: '',
        alarms: '',
        notes: '',
    });

    const { data: entry, isLoading } = useQuery({
        queryKey: ['dialysis-flowsheet', id],
        queryFn: () => dialysisFlowsheetService.getEntry(id!),
        enabled: isEditMode,
    });

    const sessionSearch = sessionInput.trim();

    const { data: sessionsData, isLoading: isSessionsLoading } = useQuery({
        queryKey: ['dialysis-sessions', 'flowsheet-picker', sessionSearch],
        queryFn: () =>
            dialysisService.getSessions({
                page: 1,
                limit: 10,
                search: sessionSearch || undefined,
            }),
    });

    useEffect(() => {
        if (!entry) return;
        setFormData({
            sessionId: entry.sessionId,
            recordedAt: formatDateTimeLocal(new Date(entry.recordedAt)),
            bpSystolic: entry.bpSystolic?.toString() || '',
            bpDiastolic: entry.bpDiastolic?.toString() || '',
            heartRate: entry.heartRate?.toString() || '',
            temperature: entry.temperature?.toString() || '',
            oxygenSaturation: entry.oxygenSaturation?.toString() || '',
            bloodFlowRate: entry.bloodFlowRate?.toString() || '',
            dialysateFlowRate: entry.dialysateFlowRate?.toString() || '',
            ultrafiltrationVolume: entry.ultrafiltrationVolume?.toString() || '',
            arterialPressure: entry.arterialPressure?.toString() || '',
            venousPressure: entry.venousPressure?.toString() || '',
            transmembranePressure: entry.transmembranePressure?.toString() || '',
            alarms: entry.alarms || '',
            notes: entry.notes || '',
        });
        setSessionInput(entry.sessionId);
    }, [entry]);

    const createMutation = useMutation({
        mutationFn: (payload: CreateDialysisFlowsheetEntryRequest) =>
            dialysisFlowsheetService.createEntry(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dialysis-flowsheets'] });
            navigate('/dialysis/flowsheets');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (payload: CreateDialysisFlowsheetEntryRequest) =>
            dialysisFlowsheetService.updateEntry(id!, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dialysis-flowsheets'] });
            queryClient.invalidateQueries({ queryKey: ['dialysis-flowsheet', id] });
            navigate('/dialysis/flowsheets');
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.sessionId) {
            setError('Please select a session.');
            return;
        }

        const payload: CreateDialysisFlowsheetEntryRequest = {
            sessionId: formData.sessionId,
            recordedAt: formData.recordedAt,
            bpSystolic: toNumber(formData.bpSystolic),
            bpDiastolic: toNumber(formData.bpDiastolic),
            heartRate: toNumber(formData.heartRate),
            temperature: toNumber(formData.temperature),
            oxygenSaturation: toNumber(formData.oxygenSaturation),
            bloodFlowRate: toNumber(formData.bloodFlowRate),
            dialysateFlowRate: toNumber(formData.dialysateFlowRate),
            ultrafiltrationVolume: toNumber(formData.ultrafiltrationVolume),
            arterialPressure: toNumber(formData.arterialPressure),
            venousPressure: toNumber(formData.venousPressure),
            transmembranePressure: toNumber(formData.transmembranePressure),
            alarms: formData.alarms || undefined,
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

    if (isEditMode && !entry) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Flowsheet entry not found</p>
                <Link to="/dialysis/flowsheets" className="text-blue-600 hover:underline mt-2 inline-block">
                    Back to flowsheet
                </Link>
            </div>
        );
    }

    const sessions = sessionsData?.sessions ?? [];
    const sessionOptions: SelectOption[] = sessions.map((session) => {
        const patientName = session.patient
            ? `${session.patient.firstName} ${session.patient.lastName}`
            : session.patientId;
        return {
            id: session.id,
            label: `${patientName} • ${formatDateTime(session.startTime)}`,
            subLabel: session.machineNumber ? `Machine ${session.machineNumber}` : `Session ${session.id}`,
        };
    });

    const isSaving = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6 lg:pl-0">
            <div className="flex items-center gap-4 pt-2 lg:pt-0">
                <Link to="/dialysis/flowsheets">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft size={18} className="mr-2" />
                        Back
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEditMode ? 'Edit Flowsheet Entry' : 'New Flowsheet Entry'}
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
                        <CardTitle>Session & Timing</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SearchableSelect
                                label="Session *"
                                placeholder="Search sessions by patient..."
                                value={sessionInput}
                                required
                                options={sessionOptions}
                                selectedId={formData.sessionId}
                                isLoading={isSessionsLoading}
                                onInputChange={(value) => {
                                    setSessionInput(value);
                                    setFormData((prev) => ({ ...prev, sessionId: '' }));
                                }}
                                onSelect={(option) => {
                                    setSessionInput(option.label);
                                    setFormData((prev) => ({ ...prev, sessionId: option.id }));
                                }}
                            />
                            <Input
                                label="Recorded At *"
                                type="datetime-local"
                                name="recordedAt"
                                value={formData.recordedAt}
                                onChange={(e) => setFormData((prev) => ({ ...prev, recordedAt: e.target.value }))}
                                required
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Vitals</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="BP Systolic"
                                type="number"
                                step="1"
                                name="bpSystolic"
                                value={formData.bpSystolic}
                                onChange={(e) => setFormData((prev) => ({ ...prev, bpSystolic: e.target.value }))}
                            />
                            <Input
                                label="BP Diastolic"
                                type="number"
                                step="1"
                                name="bpDiastolic"
                                value={formData.bpDiastolic}
                                onChange={(e) => setFormData((prev) => ({ ...prev, bpDiastolic: e.target.value }))}
                            />
                            <Input
                                label="Heart Rate"
                                type="number"
                                step="1"
                                name="heartRate"
                                value={formData.heartRate}
                                onChange={(e) => setFormData((prev) => ({ ...prev, heartRate: e.target.value }))}
                            />
                            <Input
                                label="Temperature"
                                type="number"
                                step="0.1"
                                name="temperature"
                                value={formData.temperature}
                                onChange={(e) => setFormData((prev) => ({ ...prev, temperature: e.target.value }))}
                            />
                            <Input
                                label="O2 Saturation"
                                type="number"
                                step="1"
                                name="oxygenSaturation"
                                value={formData.oxygenSaturation}
                                onChange={(e) => setFormData((prev) => ({ ...prev, oxygenSaturation: e.target.value }))}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Dialysis Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="Blood Flow Rate"
                                type="number"
                                step="1"
                                name="bloodFlowRate"
                                value={formData.bloodFlowRate}
                                onChange={(e) => setFormData((prev) => ({ ...prev, bloodFlowRate: e.target.value }))}
                            />
                            <Input
                                label="Dialysate Flow Rate"
                                type="number"
                                step="1"
                                name="dialysateFlowRate"
                                value={formData.dialysateFlowRate}
                                onChange={(e) => setFormData((prev) => ({ ...prev, dialysateFlowRate: e.target.value }))}
                            />
                            <Input
                                label="UF Volume"
                                type="number"
                                step="0.1"
                                name="ultrafiltrationVolume"
                                value={formData.ultrafiltrationVolume}
                                onChange={(e) => setFormData((prev) => ({ ...prev, ultrafiltrationVolume: e.target.value }))}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Pressures</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="Arterial Pressure"
                                type="number"
                                step="1"
                                name="arterialPressure"
                                value={formData.arterialPressure}
                                onChange={(e) => setFormData((prev) => ({ ...prev, arterialPressure: e.target.value }))}
                            />
                            <Input
                                label="Venous Pressure"
                                type="number"
                                step="1"
                                name="venousPressure"
                                value={formData.venousPressure}
                                onChange={(e) => setFormData((prev) => ({ ...prev, venousPressure: e.target.value }))}
                            />
                            <Input
                                label="TMP"
                                type="number"
                                step="1"
                                name="transmembranePressure"
                                value={formData.transmembranePressure}
                                onChange={(e) => setFormData((prev) => ({ ...prev, transmembranePressure: e.target.value }))}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Alarms"
                                name="alarms"
                                value={formData.alarms}
                                onChange={(e) => setFormData((prev) => ({ ...prev, alarms: e.target.value }))}
                                placeholder="e.g., High TMP"
                            />
                            <textarea
                                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                                rows={3}
                                placeholder="Optional notes"
                                value={formData.notes}
                                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" size="lg" isLoading={isSaving}>
                        <Save size={18} className="mr-2" />
                        {isEditMode ? 'Update Entry' : 'Save Entry'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
