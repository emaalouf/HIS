import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cardiologyHeartFailureService } from '../../services/cardiology-heart-failure.service';
import { Button, Card, Input } from '../../components/ui';
import { formatDateTime } from '../../lib/utils';
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { CardiologyHeartFailure } from '../../services/cardiology-heart-failure.service';
import type { CardiologyTestStatus } from '../../types';
import { CardiologyNav } from './CardiologyNav';

const statusOptions: CardiologyTestStatus[] = [
    'ORDERED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
];

const nyhaClassOptions = [
    { value: 'CLASS_I', label: 'Class I' },
    { value: 'CLASS_II', label: 'Class II' },
    { value: 'CLASS_III', label: 'Class III' },
    { value: 'CLASS_IV', label: 'Class IV' },
];

const heartFailureStageOptions = [
    { value: 'STAGE_A', label: 'Stage A' },
    { value: 'STAGE_B', label: 'Stage B' },
    { value: 'STAGE_C', label: 'Stage C' },
    { value: 'STAGE_D', label: 'Stage D' },
];

const statusStyles: Record<CardiologyTestStatus, string> = {
    ORDERED: 'bg-slate-100 text-slate-700',
    IN_PROGRESS: 'bg-amber-100 text-amber-700',
    COMPLETED: 'bg-emerald-100 text-emerald-700',
    CANCELLED: 'bg-rose-100 text-rose-700',
};

export function CardiologyHeartFailurePage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState<CardiologyTestStatus | ''>('');
    const [nyhaClass, setNyhaClass] = useState('');
    const [heartFailureStage, setHeartFailureStage] = useState('');
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const limit = 10;

    const { data, isLoading } = useQuery({
        queryKey: ['cardiology-heart-failure', page, status, search, nyhaClass, heartFailureStage],
        queryFn: () =>
            cardiologyHeartFailureService.getAssessments({
                page,
                limit,
                status: status || undefined,
                search: search || undefined,
                nyhaClass: nyhaClass || undefined,
                heartFailureStage: heartFailureStage || undefined,
            }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => cardiologyHeartFailureService.deleteAssessment(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cardiology-heart-failure'] });
        },
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    const handleDelete = (assessment: CardiologyHeartFailure) => {
        if (deleteMutation.isPending) return;
        if (window.confirm('Delete this heart failure assessment? This cannot be undone.')) {
            deleteMutation.mutate(assessment.id);
        }
    };

    const assessments = data?.assessments ?? [];
    const pagination = data?.pagination;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Cardiology Heart Failure</h1>
                    <p className="text-gray-500 mt-1">Track heart failure assessments and management.</p>
                </div>
                <Link to="/cardiology/heart-failure/new">
                    <Button>
                        <Plus size={18} className="mr-2" />
                        New Assessment
                    </Button>
                </Link>
            </div>

            <CardiologyNav />

            <Card className="p-4">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            placeholder="Search by patient, etiology, or symptoms..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="w-full md:w-48">
                        <select
                            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value as CardiologyTestStatus | '');
                                setPage(1);
                            }}
                        >
                            <option value="">All statuses</option>
                            {statusOptions.map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-full md:w-48">
                        <select
                            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                            value={nyhaClass}
                            onChange={(e) => {
                                setNyhaClass(e.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="">All NYHA Classes</option>
                            {nyhaClassOptions.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-full md:w-48">
                        <select
                            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                            value={heartFailureStage}
                            onChange={(e) => {
                                setHeartFailureStage(e.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="">All Stages</option>
                            {heartFailureStageOptions.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                    <Button type="submit">Search</Button>
                </form>
            </Card>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Patient</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Assessed</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">NYHA Class</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Stage</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">LVEF</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        Loading heart failure assessments...
                                    </td>
                                </tr>
                            ) : assessments.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        No heart failure assessments found
                                    </td>
                                </tr>
                            ) : (
                                assessments.map((assessment) => (
                                    <tr key={assessment.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">
                                                {assessment.patient
                                                    ? `${assessment.patient.firstName} ${assessment.patient.lastName}`
                                                    : assessment.patientId}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {assessment.patient?.mrn || assessment.patientId}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {formatDateTime(assessment.assessmentDate)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {assessment.nyhaClass ? assessment.nyhaClass.split('_').join(' ') : '—'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {assessment.heartFailureStage ? assessment.heartFailureStage.split('_').join(' ') : '—'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {assessment.lvef != null ? `${assessment.lvef}%` : '—'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[assessment.status]}`}>
                                                {assessment.status.split('_').join(' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link to={`/cardiology/heart-failure/${assessment.id}/edit`}>
                                                    <Button variant="outline" size="sm">
                                                        <Pencil size={16} />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(assessment)}
                                                    disabled={deleteMutation.isPending}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {pagination && pagination.totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} Assessments
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                <ChevronLeft size={16} />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                disabled={page === pagination.totalPages}
                            >
                                <ChevronRight size={16} />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
