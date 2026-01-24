import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dialysisStationService } from '../../services/dialysis-station.service';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import type { CreateDialysisStationRequest, DialysisStationStatus } from '../../types';
import { DialysisNav } from './DialysisNav';

const statusOptions: DialysisStationStatus[] = ['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'OUT_OF_SERVICE'];

const defaultFormData: CreateDialysisStationRequest = {
    name: '',
    room: '',
    machineNumber: '',
    status: 'AVAILABLE',
    lastServiceDate: '',
    nextServiceDate: '',
    notes: '',
    isActive: true,
};

export function DialysisStationFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const [formData, setFormData] = useState<CreateDialysisStationRequest>(defaultFormData);
    const isEditMode = Boolean(id);

    const { data: station, isLoading } = useQuery({
        queryKey: ['dialysis-station', id],
        queryFn: () => dialysisStationService.getStation(id!),
        enabled: isEditMode,
    });

    useEffect(() => {
        if (!station) return;
        setFormData({
            name: station.name,
            room: station.room || '',
            machineNumber: station.machineNumber || '',
            status: station.status,
            lastServiceDate: station.lastServiceDate || '',
            nextServiceDate: station.nextServiceDate || '',
            notes: station.notes || '',
            isActive: station.isActive ?? true,
        });
    }, [station]);

    const createMutation = useMutation({
        mutationFn: dialysisStationService.createStation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dialysis-stations'] });
            navigate('/dialysis/stations');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (payload: CreateDialysisStationRequest) => dialysisStationService.updateStation(id!, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dialysis-stations'] });
            queryClient.invalidateQueries({ queryKey: ['dialysis-station', id] });
            navigate('/dialysis/stations');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.name) {
            setError('Station name is required.');
            return;
        }

        if (isEditMode) {
            updateMutation.mutate(formData);
        } else {
            createMutation.mutate(formData);
        }
    };

    if (isEditMode && isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (isEditMode && !station) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Station not found</p>
                <Link to="/dialysis/stations" className="text-blue-600 hover:underline mt-2 inline-block">
                    Back to stations
                </Link>
            </div>
        );
    }

    const isSaving = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6 lg:pl-0">
            <div className="flex items-center gap-4 pt-2 lg:pt-0">
                <Link to="/dialysis/stations">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft size={18} className="mr-2" />
                        Back
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEditMode ? 'Edit Station' : 'New Station'}
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
                        <CardTitle>Station Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Station Name *"
                                name="name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                required
                            />
                            <Input
                                label="Room"
                                name="room"
                                value={formData.room}
                                onChange={(e) => setFormData(prev => ({ ...prev, room: e.target.value }))}
                            />
                            <Input
                                label="Machine Number"
                                name="machineNumber"
                                value={formData.machineNumber}
                                onChange={(e) => setFormData(prev => ({ ...prev, machineNumber: e.target.value }))}
                            />
                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as DialysisStationStatus }))}
                                    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {statusOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <Input
                                label="Last Service Date"
                                type="date"
                                name="lastServiceDate"
                                value={formData.lastServiceDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, lastServiceDate: e.target.value }))}
                            />
                            <Input
                                label="Next Service Date"
                                type="date"
                                name="nextServiceDate"
                                value={formData.nextServiceDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, nextServiceDate: e.target.value }))}
                            />
                        </div>
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
                                checked={formData.isActive ?? true}
                                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            Active station
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
                            placeholder="Maintenance notes or details"
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" size="lg" isLoading={isSaving}>
                        <Save size={18} className="mr-2" />
                        {isEditMode ? 'Update Station' : 'Save Station'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
