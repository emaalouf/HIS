import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { wardService } from '../../services/ward.service';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import type { CreateWardRequest } from '../../types';
import { AdmissionsNav } from './AdmissionsNav';

const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
];

type WardFormState = {
    name: string;
    departmentId: string;
    notes: string;
    isActive: boolean;
};

export function WardFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState<WardFormState>({
        name: '',
        departmentId: '',
        notes: '',
        isActive: true,
    });

    const { data: ward, isLoading } = useQuery({
        queryKey: ['ward', id],
        queryFn: () => wardService.getWard(id!),
        enabled: isEditMode,
    });

    useEffect(() => {
        if (!ward) return;
        setFormData({
            name: ward.name,
            departmentId: ward.departmentId || '',
            notes: ward.notes || '',
            isActive: ward.isActive,
        });
    }, [ward]);

    const createMutation = useMutation({
        mutationFn: (payload: CreateWardRequest) => wardService.createWard(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wards'] });
            navigate('/admissions/wards');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (payload: CreateWardRequest) => wardService.updateWard(id!, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wards'] });
            queryClient.invalidateQueries({ queryKey: ['ward', id] });
            navigate('/admissions/wards');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.name.trim()) {
            setError('Please enter a ward name.');
            return;
        }

        const payload: CreateWardRequest = {
            name: formData.name.trim(),
            departmentId: formData.departmentId || undefined,
            notes: formData.notes || undefined,
            isActive: formData.isActive,
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

    if (isEditMode && !ward) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Ward not found</p>
                <Link to="/admissions/wards" className="text-blue-600 hover:underline mt-2 inline-block">
                    Back to wards
                </Link>
            </div>
        );
    }

    const isSaving = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 lg:pl-0">
            <div className="flex items-center gap-4 pt-2 lg:pt-0">
                <Link to="/admissions/wards">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft size={18} className="mr-2" />
                        Back
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEditMode ? 'Edit Ward' : 'New Ward'}
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
                        <CardTitle>Ward Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            label="Ward Name"
                            value={formData.name}
                            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                            required
                        />
                        <Input
                            label="Department ID"
                            value={formData.departmentId}
                            onChange={(e) => setFormData((prev) => ({ ...prev, departmentId: e.target.value }))}
                            placeholder="Optional department ID"
                        />
                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                                value={formData.isActive ? 'active' : 'inactive'}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, isActive: e.target.value === 'active' }))
                                }
                            >
                                {statusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
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
                        {isEditMode ? 'Update Ward' : 'Save Ward'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
