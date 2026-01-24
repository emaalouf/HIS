import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { nephrologyImagingService } from '../../services/nephrology-imaging.service';
import { Button, Card, Input } from '../../components/ui';
import { formatDateTime } from '../../lib/utils';
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { NephrologyImaging, NephrologyImagingModality, NephrologyTestStatus } from '../../types';
import { NephrologyNav } from './NephrologyNav';

const statusOptions: NephrologyTestStatus[] = [
    'ORDERED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
];

const statusStyles: Record<NephrologyTestStatus, string> = {
    ORDERED: 'bg-slate-100 text-slate-700',
    IN_PROGRESS: 'bg-amber-100 text-amber-700',
    COMPLETED: 'bg-emerald-100 text-emerald-700',
    CANCELLED: 'bg-rose-100 text-rose-700',
};

const modalityOptions: NephrologyImagingModality[] = [
    'ULTRASOUND',
    'CT',
    'MRI',
    'XRAY',
    'NUCLEAR',
    'OTHER',
];

export function NephrologyImagingPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState<NephrologyTestStatus | ''>('');
    const [modality, setModality] = useState<NephrologyImagingModality | ''>('');
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const limit = 10;

    const { data, isLoading } = useQuery({
        queryKey: ['nephrology-imaging', page, status, modality, search],
        queryFn: () =>
            nephrologyImagingService.getStudies({
                page,
                limit,
                status: status || undefined,
                modality: modality || undefined,
                search: search || undefined,
            }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => nephrologyImagingService.deleteStudy(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['nephrology-imaging'] });
        },
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    const handleDelete = (study: NephrologyImaging) => {
        if (deleteMutation.isPending) return;
        if (window.confirm('Delete this imaging study? This cannot be undone.')) {
            deleteMutation.mutate(study.id);
        }
    };

    const studies = data?.studies ?? [];
    const pagination = data?.pagination;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Nephrology Imaging</h1>
                    <p className="text-gray-500 mt-1">Review renal imaging studies and findings.</p>
                </div>
                <Link to="/nephrology/imaging/new">
                    <Button>
                        <Plus size={18} className="mr-2" />
                        New Imaging
                    </Button>
                </Link>
            </div>

            <NephrologyNav />

            <Card className="p-4">
                <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            placeholder="Search by patient, study type, or impression..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="w-full lg:w-44">
                        <select
                            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value as NephrologyTestStatus | '');
                                setPage(1);
                            }}
                        >
                            <option value="">All statuses</option>
                            {statusOptions.map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-full lg:w-44">
                        <select
                            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                            value={modality}
                            onChange={(e) => {
                                setModality(e.target.value as NephrologyImagingModality | '');
                                setPage(1);
                            }}
                        >
                            <option value="">All modalities</option>
                            {modalityOptions.map((option) => (
                                <option key={option} value={option}>{option}</option>
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
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Performed</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Modality</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Study</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Loading imaging studies...
                                    </td>
                                </tr>
                            ) : studies.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No imaging studies found
                                    </td>
                                </tr>
                            ) : (
                                studies.map((study) => (
                                    <tr key={study.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">
                                                {study.patient
                                                    ? `${study.patient.firstName} ${study.patient.lastName}`
                                                    : study.patientId}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {study.patient?.mrn || study.patientId}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {formatDateTime(study.performedAt)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {study.modality}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {study.studyType || '--'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[study.status]}`}>
                                                {study.status.split('_').join(' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link to={`/nephrology/imaging/${study.id}/edit`}>
                                                    <Button variant="outline" size="sm">
                                                        <Pencil size={16} />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(study)}
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
                            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} studies
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
