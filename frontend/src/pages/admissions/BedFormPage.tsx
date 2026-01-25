import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bedService } from '../../services/bed.service';
import { wardService } from '../../services/ward.service';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, SearchableSelect } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import type { BedStatus, CreateBedRequest } from '../../types';
import type { SelectOption } from '../../components/ui/SearchableSelect';
import { AdmissionsNav } from './AdmissionsNav';

const statusOptions: BedStatus[] = [
    'AVAILABLE',
    'OCCUPIED',
    'CLEANING',
    'MAINTENANCE',
];

type BedFormState = {
    wardId: string;
    bedLabel: string;
    roomNumber: string;
    status: BedStatus;
    isActive: boolean;
    notes: string;
};

export function BedFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const isEditMode = Boolean(id);
    const [wardInput, setWardInput] = useState('');

    const [formData, setFormData] = useState<BedFormState>({
        wardId: '',
        bedLabel: '',
        roomNumber: '',
        status: 'AVAILABLE',
        isActive: true,
        notes: '',
    });

    const { data: bed, isLoading } = useQuery({
        queryKey: ['bed', id],
        queryFn: () => bedService.getBed(id!),
        enabled: isEditMode,
    });

    const wardSearch = wardInput.trim();

    const { data: wardsData, isLoading: isWardsLoading } = useQuery({
        queryKey: ['wards', 'bed-picker', wardSearch],
        queryFn: () =>
            wardService.getWards({
                page: 1,
                limit: 10,
                search: wardSearch || undefined,
            }),
    });

    useEffect(() => {
        if (!bed) return;
        setFormData({
            wardId: bed.wardId,
            bedLabel: bed.bedLabel,
            roomNumber: bed.roomNumber || '',
            status: bed.status,
            isActive: bed.isActive,
            notes: bed.notes || '',
        });
        if (bed.ward) {
            setWardInput(bed.ward.name);
        } else {
            setWardInput(bed.wardId);
        }
    }, [bed]);

    const createMutation = useMutation({
        mutationFn: (payload: CreateBedRequest) => bedService.createBed(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['beds'] });
            navigate('/admissions/beds');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (payload: CreateBedRequest) => bedService.updateBed(id!, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['beds'] });
            queryClient.invalidateQueries({ queryKey: ['bed', id] });
            navigate('/admissions/beds');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.wardId) {
            setError('Please select a ward.');
            return;
        }
        if (!formData.bedLabel.trim()) {
            setError('Please enter a bed label.');
            return;
        }

        const payload: CreateBedRequest = {
            wardId: formData.wardId,
            bedLabel: formData.bedLabel.trim(),
            roomNumber: formData.roomNumber || undefined,
            status: formData.status,
            isActive: formData.isActive,
            notes: formData.notes || undefined,
        };

        if (isEditMode) {
            updateMutation.mutate(payload);
        } else {
            createMutation.mutate(payload);
        }
    };

    const wardOptions: SelectOption[] = (wardsData?.wards || []).map((ward) => ({
        id: ward.id,
        label: ward.name,
        subLabel: ward.department?.name || ward.departmentId || undefined,
    }));

    if (isEditMode && isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (isEditMode && !bed) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Bed not found</p>
                <Link to="/admissions/beds" className="text-blue-600 hover:underline mt-2 inline-block">
                    Back to beds
                </Link>
            </div>
        );
    }

    const isSaving = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 lg:pl-0">
            <div className="flex items-center gap-4 pt-2 lg:pt-0">
                <Link to="/admissions/beds">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft size={18} className="mr-2" />
                        Back
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEditMode ? 'Edit Bed' : 'New Bed'}
                </h1>
            </div>

            <AdmissionsNav />

            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                        <p className="text-red-700 text-sm">{error}</p>
                    </CardContent>
                </Card>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Bed Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <SearchableSelect
                            label="Ward"
                            value={wardInput}
                            required
                            options={wardOptions}
                            selectedId={formData.wardId}
                            isLoading={isWardsLoading}
                            placeholder="Search wards"
                            onInputChange={setWardInput}
                            onSelect={(option) => {
                                setFormData((prev) => ({ ...prev, wardId: option.id }));
                                setWardInput(option.label);
                            }}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Bed Label"
                                value={formData.bedLabel}
                                onChange={(e) => setFormData((prev) => ({ ...prev, bedLabel: e.target.value }))}
                                placeholder="e.g., B12"
                                required
                            />
                            <Input
                                label="Room Number"
                                value={formData.roomNumber}
                                onChange={(e) => setFormData((prev) => ({ ...prev, roomNumber: e.target.value }))}
                                placeholder="Optional"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                                    value={formData.status}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, status: e.target.value as BedStatus }))
                                    }
                                >
                                    {statusOptions.map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Active</label>
                                <select
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                                    value={formData.isActive ? 'active' : 'inactive'}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, isActive: e.target.value === 'active' }))
                                    }
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                            <textarea
                                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                                rows={4}
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
                        {isEditMode ? 'Update Bed' : 'Save Bed'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
