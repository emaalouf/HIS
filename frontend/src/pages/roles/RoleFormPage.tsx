import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { roleService } from '../../services/role.service';
import { permissionService } from '../../services/permission.service';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import type { AccessRole, CreateRoleRequest, Permission } from '../../types';

const defaultFormData: CreateRoleRequest = {
    name: '',
    description: '',
    isActive: true,
    permissionIds: [],
};

export function RoleFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const [formData, setFormData] = useState<CreateRoleRequest>(defaultFormData);
    const isEditMode = Boolean(id);

    const { data: role, isLoading } = useQuery({
        queryKey: ['role', id],
        queryFn: () => roleService.getRole(id!),
        enabled: isEditMode,
    });

    const { data: permissionsData, isLoading: isPermissionsLoading } = useQuery({
        queryKey: ['permissions', 'all'],
        queryFn: () => permissionService.getPermissions({ page: 1, limit: 200 }),
    });

    useEffect(() => {
        if (role) {
            const rawPermissions = (role as AccessRole & { permissions?: Array<Permission | string> }).permissions ?? [];
            const permissionIds = rawPermissions.map((perm) => (typeof perm === 'string' ? perm : perm.id));
            setFormData({
                name: role.name,
                description: role.description || '',
                isActive: role.isActive ?? true,
                permissionIds,
            });
        }
    }, [role]);

    const createMutation = useMutation({
        mutationFn: roleService.createRole,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            navigate('/roles');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: CreateRoleRequest) => roleService.updateRole(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            queryClient.invalidateQueries({ queryKey: ['role', id] });
            navigate('/roles');
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

    const togglePermission = (permissionId: string) => {
        setFormData((prev) => {
            const current = prev.permissionIds ?? [];
            const exists = current.includes(permissionId);
            return {
                ...prev,
                permissionIds: exists
                    ? current.filter((id) => id !== permissionId)
                    : [...current, permissionId],
            };
        });
    };

    if (isEditMode && isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (isEditMode && !role) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Role not found</p>
                <Link to="/roles" className="text-blue-600 hover:underline mt-2 inline-block">
                    Back to roles
                </Link>
            </div>
        );
    }

    const permissions = permissionsData?.permissions ?? [];
    const isSaving = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6 lg:pl-0">
            <div className="flex items-center gap-4 pt-2 lg:pt-0">
                <Link to="/roles">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft size={18} className="mr-2" />
                        Back
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEditMode ? 'Edit Role' : 'New Role'}
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
                        <CardTitle>Role Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Role Name *"
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
                        <CardTitle>Permissions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between mb-3 text-sm text-gray-500">
                            <span>Select permissions granted to this role.</span>
                            <Link to="/permissions/new" className="text-blue-600 hover:underline">
                                Create permission
                            </Link>
                        </div>
                        {isPermissionsLoading ? (
                            <div className="text-sm text-gray-500">Loading permissions...</div>
                        ) : permissions.length === 0 ? (
                            <div className="text-sm text-gray-500">No permissions available.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {permissions.map((permission) => {
                                    const isChecked = formData.permissionIds?.includes(permission.id);
                                    return (
                                        <label
                                            key={permission.id}
                                            className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                                        >
                                            <input
                                                type="checkbox"
                                                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                checked={isChecked}
                                                onChange={() => togglePermission(permission.id)}
                                            />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{permission.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    {permission.description || permission.key || 'No description'}
                                                </p>
                                            </div>
                                        </label>
                                    );
                                })}
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
                                checked={formData.isActive ?? true}
                                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            Active role
                        </label>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" size="lg" isLoading={isSaving}>
                        <Save size={18} className="mr-2" />
                        {isEditMode ? 'Update Role' : 'Save Role'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
