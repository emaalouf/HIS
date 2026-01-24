import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { providerService } from '../../services/provider.service';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import type { CreateProviderRequest, Role } from '../../types';

const providerRoles: Role[] = ['DOCTOR', 'NURSE'];

const defaultFormData: CreateProviderRequest = {
    firstName: '',
    lastName: '',
    role: 'DOCTOR',
    email: '',
    phone: '',
    specialty: '',
    department: '',
    licenseNumber: '',
    isActive: true,
};

export function ProviderFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const [formData, setFormData] = useState<CreateProviderRequest>(defaultFormData);
    const isEditMode = Boolean(id);

    const { data: provider, isLoading } = useQuery({
        queryKey: ['provider', id],
        queryFn: () => providerService.getProvider(id!),
        enabled: isEditMode,
    });

    useEffect(() => {
        if (provider) {
            setFormData({
                firstName: provider.firstName,
                lastName: provider.lastName,
                role: provider.role,
                email: provider.email || '',
                phone: provider.phone || '',
                specialty: provider.specialty || '',
                department: provider.department || '',
                licenseNumber: provider.licenseNumber || '',
                isActive: provider.isActive ?? true,
            });
        }
    }, [provider]);

    const createMutation = useMutation({
        mutationFn: providerService.createProvider,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['providers'] });
            queryClient.invalidateQueries({ queryKey: ['appointments-meta'] });
            navigate('/providers');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: CreateProviderRequest) => providerService.updateProvider(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['providers'] });
            queryClient.invalidateQueries({ queryKey: ['provider', id] });
            queryClient.invalidateQueries({ queryKey: ['appointments-meta'] });
            navigate('/providers');
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (isEditMode && isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (isEditMode && !provider) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Provider not found</p>
                <Link to="/providers" className="text-blue-600 hover:underline mt-2 inline-block">
                    Back to providers
                </Link>
            </div>
        );
    }

    const roleOptions = provider && !providerRoles.includes(provider.role)
        ? [provider.role, ...providerRoles]
        : providerRoles;

    const isSaving = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6 lg:pl-0">
            <div className="flex items-center gap-4 pt-2 lg:pt-0">
                <Link to="/providers">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft size={18} className="mr-2" />
                        Back
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEditMode ? 'Edit Provider' : 'New Provider'}
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
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="First Name *"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="Last Name *"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                            />
                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    {roleOptions.map((role) => (
                                        <option key={role} value={role}>
                                            {role}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            <Input
                                label="Phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Professional Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Specialty"
                                name="specialty"
                                value={formData.specialty}
                                onChange={handleChange}
                            />
                            <Input
                                label="Department"
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                            />
                            <Input
                                label="License Number"
                                name="licenseNumber"
                                value={formData.licenseNumber}
                                onChange={handleChange}
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
                            Active provider
                        </label>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" size="lg" isLoading={isSaving}>
                        <Save size={18} className="mr-2" />
                        {isEditMode ? 'Update Provider' : 'Save Provider'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
