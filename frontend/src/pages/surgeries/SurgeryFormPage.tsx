import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { surgeryService } from '../../services/surgery.service';
import { patientService } from '../../services/patient.service';
import { operatingTheaterService } from '../../services/operating-theater.service';
import { Button, Card, Input } from '../../components/ui';
import { ArrowLeft, Save, Users } from 'lucide-react';
import type { CreateSurgeryRequest, SurgeryStatus, SurgeryPriority } from '../../types';

export function SurgeryFormPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const queryClient = useQueryClient();
    const isEdit = !!id;

    const [patientId, setPatientId] = useState('');
    const [admissionId, setAdmissionId] = useState('');
    const [theaterId, setTheaterId] = useState('');
    const [status, setStatus] = useState<SurgeryStatus>('REQUESTED');
    const [priority, setPriority] = useState<SurgeryPriority>('ELECTIVE');
    const [scheduledStart, setScheduledStart] = useState('');
    const [scheduledEnd, setScheduledEnd] = useState('');
    const [preOpDiagnosis, setPreOpDiagnosis] = useState('');
    const [postOpDiagnosis, setPostOpDiagnosis] = useState('');
    const [procedureName, setProcedureName] = useState('');

    const { data: surgery, isLoading } = useQuery({
        queryKey: ['surgery', id],
        queryFn: () => surgeryService.getSurgery(id!),
        enabled: isEdit,
        queryClient,
        onSuccess: (data) => {
            setPatientId(data.patientId);
            setAdmissionId(data.admissionId || '');
            setTheaterId(data.theaterId || '');
            setStatus(data.status);
            setPriority(data.priority);
            setScheduledStart(data.scheduledStart);
            setScheduledEnd(data.scheduledEnd);
            setPreOpDiagnosis(data.preOpDiagnosis);
            setPostOpDiagnosis(data.postOpDiagnosis || '');
            setProcedureName(data.procedureName);
        },
    });

    const { data: patients } = useQuery({
        queryKey: ['patients'],
        queryFn: () => patientService.getPatients({ limit: 100, sortBy: 'lastName', sortOrder: 'asc' }),
    });

    const { data: theaters } = useQuery({
        queryKey: ['operatingTheaters'],
        queryFn: () => operatingTheaterService.getOperatingTheaters({ limit: 100, status: 'ACTIVE' }),
    });

    const mutation = useMutation({
        mutationFn: (data: CreateSurgeryRequest) =>
            isEdit ? surgeryService.updateSurgery(id!, data) : surgeryService.createSurgery(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['surgeries'] });
            navigate('/surgeries');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate({
            patientId,
            admissionId: admissionId || undefined,
            theaterId: theaterId || undefined,
            status,
            priority,
            scheduledStart,
            scheduledEnd,
            preOpDiagnosis,
            postOpDiagnosis: postOpDiagnosis || undefined,
            procedureName,
        });
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    const statusOptions: { label: string; value: SurgeryStatus }[] = [
        { label: 'Requested', value: 'REQUESTED' },
        { label: 'Scheduled', value: 'SCHEDULED' },
        { label: 'Pre-Op', value: 'PRE_OP' },
        { label: 'In Progress', value: 'IN_PROGRESS' },
        { label: 'Recovery', value: 'RECOVERY' },
        { label: 'Completed', value: 'COMPLETED' },
        { label: 'Cancelled', value: 'CANCELLED' },
    ];

    const priorityOptions: { label: string; value: SurgeryPriority }[] = [
        { label: 'Elective', value: 'ELECTIVE' },
        { label: 'Urgent', value: 'URGENT' },
        { label: 'Emergency', value: 'EMERGENCY' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/surgeries')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isEdit ? 'Edit Surgery' : 'New Surgery'}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {isEdit ? 'Update surgical procedure information' : 'Schedule a new surgical procedure'}
                    </p>
                </div>
            </div>

            <Card className="max-w-2xl">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Patient
                            </label>
                            <select
                                className="w-full flex h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={patientId}
                                onChange={(e) => setPatientId(e.target.value)}
                                required
                            >
                                <option value="">Select patient</option>
                                {patients?.patients.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.firstName} {p.lastName} ({p.mrn})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Operating Theater
                            </label>
                            <select
                                className="w-full flex h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={theaterId}
                                onChange={(e) => setTheaterId(e.target.value)}
                            >
                                <option value="">Select theater (optional)</option>
                                {theaters?.theaters.map((t) => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                className="w-full flex h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={status}
                                onChange={(e) => setStatus(e.target.value as SurgeryStatus)}
                            >
                                {statusOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Priority
                            </label>
                            <select
                                className="w-full flex h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as SurgeryPriority)}
                            >
                                {priorityOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Scheduled Start"
                            type="datetime-local"
                            value={scheduledStart}
                            onChange={(e) => setScheduledStart(e.target.value)}
                            required
                        />

                        <Input
                            label="Scheduled End"
                            type="datetime-local"
                            value={scheduledEnd}
                            onChange={(e) => setScheduledEnd(e.target.value)}
                            required
                        />
                    </div>

                    <Input
                        label="Procedure Name"
                        value={procedureName}
                        onChange={(e) => setProcedureName(e.target.value)}
                        placeholder="e.g., Appendectomy"
                        required
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pre-Op Diagnosis
                        </label>
                        <textarea
                            className="flex min-h-[100px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={preOpDiagnosis}
                            onChange={(e) => setPreOpDiagnosis(e.target.value)}
                            rows={3}
                            placeholder="Pre-operative diagnosis..."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Post-Op Diagnosis
                        </label>
                        <textarea
                            className="flex min-h-[100px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={postOpDiagnosis}
                            onChange={(e) => setPostOpDiagnosis(e.target.value)}
                            rows={3}
                            placeholder="Post-operative diagnosis (optional)..."
                        />
                    </div>

                    {isEdit && (
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-start gap-3">
                                <Users className="text-blue-600 mt-0.5" size={18} />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-blue-900">Manage Team</h3>
                                    <p className="text-sm text-blue-700 mt-1">
                                        Add or remove surgical team members from surgery details page.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/surgeries')}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={mutation.isPending}>
                            <Save size={18} className="mr-2" />
                            {isEdit ? 'Update' : 'Schedule'} Surgery
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}