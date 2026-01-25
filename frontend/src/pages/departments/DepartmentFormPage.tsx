import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { departmentService } from '../../services/department.service';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import type { CreateDepartmentRequest } from '../../types';

const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
];

type DepartmentFormState = {
    name: string;
    description: string;
    isActive: boolean;
};

export function DepartmentFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState<DepartmentFormState>({
        name: '',
        description: '',
        isActive: true,
    });

    const { data: department, isLoading } = useQuery({
        queryKey: ['department', id],
        queryFn: () => departmentService.getDepartment(id!),
        enabled: isEditMode,
    });

    useEffect(() => {
        if (!department) return;
        setFormData({
            name: department.name,
            description: department.description || '',
            isActive: department.isActive ?? true,
        });
    }, [department]);

    const createMutation = useMutation({
        mutationFn: (payload: CreateDepartmentRequest) => departmentService.createDepartment(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments'] });
            navigate('/departments');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (payload: CreateDepartmentRequest) => departmentService.updateDepartment(id!, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['departments'] });
            queryClient.invalidateQueries({ queryKey: ['department', id] });
            navigate('/departments');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.name.trim()) {
            setError('Please enter a department name.');
            return;
        }

        const payload: CreateDepartmentRequest = {
            name: formData.name.trim(),
            description: formData.description || undefined,
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

    if (isEditMode && !department) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Department not found</p>
                <Link to="/departments" className="text-blue-600 hover:underline mt-2 inline-block">
                    Back to departments
                </Link>
            </div>
        );
    }

    const isSaving = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 lg:pl-0">
            <div className="flex items-center gap-4 pt-2 lg:pt-0">
                <Link to="/departments">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft size={18} className="mr-2" />
                        Back
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEditMode ? 'Edit Department' : 'New Department'}
                </h1>
            </div>

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
                        <CardTitle>Department Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            label="Department Name"
                            value={formData.name}
                            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                            required
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                                rows={4}
                                placeholder="Optional description"
                                value={formData.description}
                                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                            />
                        </div>
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
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" size="lg" isLoading={isSaving}>
                        <Save size={18} className="mr-2" />
                        {isEditMode ? 'Update Department' : 'Save Department'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
