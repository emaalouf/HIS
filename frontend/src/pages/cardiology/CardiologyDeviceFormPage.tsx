import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cardiologyDeviceService } from '../../services/cardiology-device.service';
import { providerService } from '../../services/provider.service';
import { patientService } from '../../services/patient.service';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, SearchableSelect } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import type { CardiologyDeviceStatus, CreateCardiologyDeviceRequest } from '../../types';
import type { SelectOption } from '../../components/ui/SearchableSelect';
import { CardiologyNav } from './CardiologyNav';

const statusOptions: CardiologyDeviceStatus[] = ['ACTIVE', 'INACTIVE', 'REMOVED'];

const formatDateTimeLocal = (value: Date) => {
    const local = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
};

type DeviceFormState = {
    patientId: string;
    providerId: string;
    deviceType: string;
    manufacturer: string;
    model: string;
    serialNumber: string;
    implantDate: string;
    status: CardiologyDeviceStatus;
    lastInterrogationDate: string;
    nextFollowUpDate: string;
    batteryStatus: string;
    settings: string;
    notes: string;
};

export function CardiologyDeviceFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const isEditMode = Boolean(id);
    const [patientInput, setPatientInput] = useState('');
    const [providerInput, setProviderInput] = useState('');

    const defaultImplantDate = useMemo(() => formatDateTimeLocal(new Date()), []);

    const [formData, setFormData] = useState<DeviceFormState>({
        patientId: '',
        providerId: '',
        deviceType: '',
        manufacturer: '',
        model: '',
        serialNumber: '',
        implantDate: defaultImplantDate,
        status: 'ACTIVE',
        lastInterrogationDate: '',
        nextFollowUpDate: '',
        batteryStatus: '',
        settings: '',
        notes: '',
    });

    const { data: device, isLoading } = useQuery({
        queryKey: ['cardiology-device', id],
        queryFn: () => cardiologyDeviceService.getDevice(id!),
        enabled: isEditMode,
    });

    const patientSearch = patientInput.trim();
    const providerSearch = providerInput.trim();

    const { data: patientsData, isLoading: isPatientsLoading } = useQuery({
        queryKey: ['patients', 'cardiology-device-picker', patientSearch],
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
        queryKey: ['providers', 'cardiology-device-picker', providerSearch],
        queryFn: () =>
            providerService.getProviders({
                page: 1,
                limit: 10,
                search: providerSearch || undefined,
                sortBy: providerSearch ? undefined : 'createdAt',
                sortOrder: providerSearch ? undefined : 'desc',
            }),
    });

    useEffect(() => {
        if (!device) return;
        setFormData({
            patientId: device.patientId,
            providerId: device.providerId || '',
            deviceType: device.deviceType,
            manufacturer: device.manufacturer || '',
            model: device.model || '',
            serialNumber: device.serialNumber || '',
            implantDate: device.implantDate ? formatDateTimeLocal(new Date(device.implantDate)) : '',
            status: device.status,
            lastInterrogationDate: device.lastInterrogationDate ? formatDateTimeLocal(new Date(device.lastInterrogationDate)) : '',
            nextFollowUpDate: device.nextFollowUpDate ? formatDateTimeLocal(new Date(device.nextFollowUpDate)) : '',
            batteryStatus: device.batteryStatus || '',
            settings: device.settings || '',
            notes: device.notes || '',
        });
        if (device.patient) {
            setPatientInput(`${device.patient.firstName} ${device.patient.lastName}`);
        } else {
            setPatientInput(device.patientId);
        }
        if (device.provider) {
            const prefix = device.provider.role === 'DOCTOR' ? 'Dr. ' : '';
            setProviderInput(`${prefix}${device.provider.firstName} ${device.provider.lastName}`);
        } else if (device.providerId) {
            setProviderInput(device.providerId);
        }
    }, [device]);

    const createMutation = useMutation({
        mutationFn: (payload: CreateCardiologyDeviceRequest) => cardiologyDeviceService.createDevice(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cardiology-devices'] });
            navigate('/cardiology/devices');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (payload: CreateCardiologyDeviceRequest) => cardiologyDeviceService.updateDevice(id!, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cardiology-devices'] });
            queryClient.invalidateQueries({ queryKey: ['cardiology-device', id] });
            navigate('/cardiology/devices');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.patientId) {
            setError('Please select a patient.');
            return;
        }
        if (!formData.deviceType.trim()) {
            setError('Device type is required.');
            return;
        }

        const payload: CreateCardiologyDeviceRequest = {
            patientId: formData.patientId,
            providerId: formData.providerId || undefined,
            deviceType: formData.deviceType,
            manufacturer: formData.manufacturer || undefined,
            model: formData.model || undefined,
            serialNumber: formData.serialNumber || undefined,
            implantDate: formData.implantDate || undefined,
            status: formData.status,
            lastInterrogationDate: formData.lastInterrogationDate || undefined,
            nextFollowUpDate: formData.nextFollowUpDate || undefined,
            batteryStatus: formData.batteryStatus || undefined,
            settings: formData.settings || undefined,
            notes: formData.notes || undefined,
        };

        if (isEditMode) {
            updateMutation.mutate(payload);
        } else {
            createMutation.mutate(payload);
        }
    };

    const patientOptions: SelectOption[] = (patientsData?.patients || []).map((patient) => ({
        id: patient.id,
        label: `${patient.firstName} ${patient.lastName}`,
        subLabel: patient.mrn,
    }));

    const providerOptions: SelectOption[] = (providersData?.providers || []).map((provider) => ({
        id: provider.id,
        label: `${provider.role === 'DOCTOR' ? 'Dr. ' : ''}${provider.firstName} ${provider.lastName}`,
        subLabel: provider.role,
    }));

    if (isEditMode && isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isEditMode ? 'Edit Device' : 'New Device'}
                    </h1>
                    <p className="text-gray-500 mt-1">Track implant details and follow-up status.</p>
                </div>
                <Link to="/cardiology/devices">
                    <Button variant="outline">
                        <ArrowLeft size={18} className="mr-2" />
                        Back to Devices
                    </Button>
                </Link>
            </div>

            <CardiologyNav />

            <Card>
                <CardHeader>
                    <CardTitle>Device Details</CardTitle>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-100">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <SearchableSelect
                                label="Patient"
                                placeholder="Search patients..."
                                value={patientInput}
                                required
                                options={patientOptions}
                                selectedId={formData.patientId}
                                isLoading={isPatientsLoading}
                                onInputChange={(value) => setPatientInput(value)}
                                onSelect={(option) => {
                                    setFormData((prev) => ({ ...prev, patientId: option.id }));
                                    setPatientInput(option.label);
                                }}
                            />
                            <SearchableSelect
                                label="Implanting Provider"
                                placeholder="Search providers..."
                                value={providerInput}
                                options={providerOptions}
                                selectedId={formData.providerId}
                                isLoading={isProvidersLoading}
                                onInputChange={(value) => setProviderInput(value)}
                                onSelect={(option) => {
                                    setFormData((prev) => ({ ...prev, providerId: option.id }));
                                    setProviderInput(option.label);
                                }}
                            />
                            <Input
                                label="Device Type"
                                value={formData.deviceType}
                                onChange={(e) => setFormData((prev) => ({ ...prev, deviceType: e.target.value }))}
                                required
                            />
                            <Input
                                label="Manufacturer"
                                value={formData.manufacturer}
                                onChange={(e) => setFormData((prev) => ({ ...prev, manufacturer: e.target.value }))}
                            />
                            <Input
                                label="Model"
                                value={formData.model}
                                onChange={(e) => setFormData((prev) => ({ ...prev, model: e.target.value }))}
                            />
                            <Input
                                label="Serial Number"
                                value={formData.serialNumber}
                                onChange={(e) => setFormData((prev) => ({ ...prev, serialNumber: e.target.value }))}
                            />
                            <Input
                                label="Implant Date"
                                type="datetime-local"
                                value={formData.implantDate}
                                onChange={(e) => setFormData((prev) => ({ ...prev, implantDate: e.target.value }))}
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                                    value={formData.status}
                                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as CardiologyDeviceStatus }))}
                                >
                                    {statusOptions.map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                            <Input
                                label="Last Interrogation"
                                type="datetime-local"
                                value={formData.lastInterrogationDate}
                                onChange={(e) => setFormData((prev) => ({ ...prev, lastInterrogationDate: e.target.value }))}
                            />
                            <Input
                                label="Next Follow-up"
                                type="datetime-local"
                                value={formData.nextFollowUpDate}
                                onChange={(e) => setFormData((prev) => ({ ...prev, nextFollowUpDate: e.target.value }))}
                            />
                            <Input
                                label="Battery Status"
                                value={formData.batteryStatus}
                                onChange={(e) => setFormData((prev) => ({ ...prev, batteryStatus: e.target.value }))}
                            />
                            <Input
                                label="Settings"
                                value={formData.settings}
                                onChange={(e) => setFormData((prev) => ({ ...prev, settings: e.target.value }))}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <Input
                                label="Notes"
                                value={formData.notes}
                                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                <Save size={18} className="mr-2" />
                                {isEditMode ? 'Update Device' : 'Create Device'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
