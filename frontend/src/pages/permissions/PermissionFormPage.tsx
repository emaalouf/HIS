import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { permissionService } from '../../services/permission.service';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import type { CreatePermissionRequest } from '../../types';

const defaultFormData: CreatePermissionRequest = {
    name: '',
    key: '',
    description: '',
};

export function PermissionFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const [formData, setFormData] = useState<CreatePermissionRequest>(defaultFormData);
    const isEditMode = Boolean(id);

    const { data: permission, isLoading } = useQuery({
        queryKey: ['permission', id],
        queryFn: () => permissionService.getPermission(id!),
        enabled: isEditMode,
    });

    useEffect(() => {
        if (permission) {
            setFormData({
                name: permission.name,
                key: permission.key || '',
                description: permission.description || '',
            });
        }
    }, [permission]);

    const createMutation = useMutation({
        mutationFn: permissionService.createPermission,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['permissions'] });
            navigate('/permissions');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: CreatePermissionRequest) => permissionService.updatePermission(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['permissions'] });
            queryClient.invalidateQueries({ queryKey: ['permission', id] });
            navigate('/permissions');
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

    if (isEditMode && !permission) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Permission not found</p>
                <Link to="/permissions" className="text-blue-600 hover:underline mt-2 inline-block">
                    Back to permissions
                </Link>
            </div>
        );
    }

    const isSaving = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6 lg:pl-0">
            <div className="flex items-center gap-4 pt-2 lg:pt-0">
                <Link to="/permissions">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft size={18} className="mr-2" />
                        Back
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEditMode ? 'Edit Permission' : 'New Permission'}
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
                        <CardTitle>Permission Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Permission Name *"
                                name="name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                required
                            />
                            <Input
                                label="Key"
                                name="key"
                                value={formData.key || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
                                placeholder="e.g., patients.read"
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

                <div className="flex justify-end">
                    <Button type="submit" size="lg" isLoading={isSaving}>
                        <Save size={18} className="mr-2" />
                        {isEditMode ? 'Update Permission' : 'Save Permission'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
