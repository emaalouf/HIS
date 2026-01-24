import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { specialtyService } from '../../services/specialty.service';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import type { CreateSpecialtyRequest } from '../../types';

const defaultFormData: CreateSpecialtyRequest = {
    name: '',
    description: '',
    isActive: true,
};

export function SpecialtyFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const [formData, setFormData] = useState<CreateSpecialtyRequest>(defaultFormData);
    const isEditMode = Boolean(id);

    const { data: specialty, isLoading } = useQuery({
        queryKey: ['specialty', id],
        queryFn: () => specialtyService.getSpecialty(id!),
        enabled: isEditMode,
    });

    useEffect(() => {
        if (specialty) {
            setFormData({
                name: specialty.name,
                description: specialty.description || '',
                isActive: specialty.isActive ?? true,
            });
        }
    }, [specialty]);

    const createMutation = useMutation({
        mutationFn: specialtyService.createSpecialty,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['specialties'] });
            navigate('/specialties');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: CreateSpecialtyRequest) => specialtyService.updateSpecialty(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['specialties'] });
            queryClient.invalidateQueries({ queryKey: ['specialty', id] });
            navigate('/specialties');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

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

    if (isEditMode && !specialty) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Specialty not found</p>
                <Link to="/specialties" className="text-blue-600 hover:underline mt-2 inline-block">
                    Back to specialties
                </Link>
            </div>
        );
    }

    const isSaving = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6 lg:pl-0">
            <div className="flex items-center gap-4 pt-2 lg:pt-0">
                <Link to="/specialties">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft size={18} className="mr-2" />
                        Back
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEditMode ? 'Edit Specialty' : 'New Specialty'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                        {error}
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Specialty Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Specialty Name *"
                                name="name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                required
                            />
                            <Input
                                label="Description"
                                name="description"
                                value={formData.description || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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
                            Active specialty
                        </label>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" size="lg" isLoading={isSaving}>
                        <Save size={18} className="mr-2" />
                        {isEditMode ? 'Update Specialty' : 'Save Specialty'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
