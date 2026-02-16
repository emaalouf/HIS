import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { psychiatryAssessmentService } from '../../services/psychiatry-assessment.service';
import { Button, Card, Input } from '../../components/ui';
import { formatDateTime } from '../../lib/utils';
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { PsychiatryAssessment, AssessmentType } from '../../types';
import { PsychiatryNav } from './PsychiatryNav';

const assessmentTypeOptions: AssessmentType[] = [
    'INITIAL',
    'FOLLOW_UP',
    'CRISIS',
    'DISCHARGE',
    'ANNUAL',
    'PRE_ADMISSION',
    'FORENSIC',
];

const assessmentTypeLabels: Record<AssessmentType, string> = {
    INITIAL: 'Initial',
    FOLLOW_UP: 'Follow-up',
    CRISIS: 'Crisis',
    DISCHARGE: 'Discharge',
    ANNUAL: 'Annual',
    PRE_ADMISSION: 'Pre-admission',
    FORENSIC: 'Forensic',
};

export function PsychiatryAssessmentsPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [assessmentType, setAssessmentType] = useState<AssessmentType | ''>('');
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const limit = 10;

    const { data, isLoading } = useQuery({
        queryKey: ['psychiatry-assessments', page, assessmentType, search],
        queryFn: () =>
            psychiatryAssessmentService.getAssessments({
                page,
                limit,
                assessmentType: assessmentType || undefined,
                search: search || undefined,
            }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => psychiatryAssessmentService.deleteAssessment(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['psychiatry-assessments'] });
        },
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    const handleDelete = (assessment: PsychiatryAssessment) => {
        if (deleteMutation.isPending) return;
        if (window.confirm('Delete this assessment? This cannot be undone.')) {
            deleteMutation.mutate(assessment.id);
        }
    };

    const assessments = data?.assessments ?? [];
    const pagination = data?.pagination;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Psychiatry Assessments</h1>
                    <p className="text-gray-500 mt-1">Track psychiatric evaluations and assessments.</p>
                </div>
                <Link to="/psychiatry/new">
                    <Button>
                        <Plus size={18} className="mr-2" />
                        New Assessment
                    </Button>
                </Link>
            </div>

            <PsychiatryNav />

            <Card className="p-4">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            placeholder="Search by patient, chief complaint, or diagnosis..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="w-full md:w-48">
                        <select
                            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                            value={assessmentType}
                            onChange={(e) => {
                                setAssessmentType(e.target.value as AssessmentType | '');
                                setPage(1);
                            }}
                        >
                            <option value="">All types</option>
                            {assessmentTypeOptions.map((option) => (
                                <option key={option} value={option}>{assessmentTypeLabels[option]}</option>
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
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Date</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Type</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Chief Complaint</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Primary Diagnosis</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Loading assessments...
                                    </td>
                                </tr>
                            ) : assessments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No assessments found
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
                                            {assessmentTypeLabels[assessment.assessmentType]}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                                            {assessment.chiefComplaint}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {assessment.diagnosisPrimary || '—'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link to={`/psychiatry/${assessment.id}/edit`}>
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
                            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} assessments
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
