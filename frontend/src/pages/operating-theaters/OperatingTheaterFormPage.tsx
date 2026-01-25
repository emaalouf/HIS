import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { operatingTheaterService } from '../../services/operating-theater.service';
import { Button, Card, Input } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import type { CreateOperatingTheaterRequest } from '../../types';

export function OperatingTheaterFormPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [status, setStatus] = useState('ACTIVE');
    const [notes, setNotes] = useState('');

    const { data: theater, isLoading } = useQuery({
        queryKey: ['operatingTheater', id],
        queryFn: () => operatingTheaterService.getOperatingTheater(id!),
        enabled: isEdit,
    });

    useEffect(() => {
        if (!theater || !isEdit) return;
        setName(theater.name);
        setLocation(theater.location || '');
        setStatus(theater.status);
        setNotes(theater.notes || '');
    }, [isEdit, theater]);

    const mutation = useMutation({
        mutationFn: (data: CreateOperatingTheaterRequest) =>
            isEdit
                ? operatingTheaterService.updateOperatingTheater(id!, data)
                : operatingTheaterService.createOperatingTheater(data),
        onSuccess: () => {
            navigate('/operating-theaters');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate({ name, location, status, notes: notes || undefined });
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/operating-theaters')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isEdit ? 'Edit Operating Theater' : 'New Operating Theater'}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {isEdit ? 'Update operating theater information' : 'Add a new operating theater'}
                    </p>
                </div>
            </div>

            <Card className="max-w-2xl">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <Input
                        label="Theater Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

                    <Input
                        label="Location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g., Building 2, Floor 3"
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <select
                            className="w-full flex h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notes
                        </label>
                        <textarea
                            className="flex min-h-[100px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={4}
                            placeholder="Additional notes about this operating theater..."
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/operating-theaters')}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={mutation.isPending}>
                            <Save size={18} className="mr-2" />
                            {isEdit ? 'Update' : 'Create'} Theater
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
