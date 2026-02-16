import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { psychiatryMedicationService } from '../../services/psychiatry-medication.service';
import { Button, Card, Input } from '../../components/ui';
import { formatDateTime } from '../../lib/utils';
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { PsychiatryMedication } from '../../types';
import { PsychiatryNav } from './PsychiatryNav';

export function PsychiatryMedicationPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const limit = 10;

    const { data, isLoading } = useQuery({
        queryKey: ['psychiatry-medications', page, search],
        queryFn: () =>
            psychiatryMedicationService.getMedications({
                page,
                limit,
                search: search || undefined,
            }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => psychiatryMedicationService.deleteMedication(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['psychiatry-medications'] });
        },
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    const handleDelete = (medication: PsychiatryMedication) => {
        if (deleteMutation.isPending) return;
        if (window.confirm('Delete this medication record? This cannot be undone.')) {
            deleteMutation.mutate(medication.id);
        }
    };

    const medications = data?.medications ?? [];
    const pagination = data?.pagination;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Psychiatry Medications</h1>
                    <p className="text-gray-500 mt-1">Track psychiatric medication management.</p>
                </div>
                <Link to="/psychiatry/medications/new">
                    <Button>
                        <Plus size={18} className="mr-2" />
                        New Medication
                    </Button>
                </Link>
            </div>

            <PsychiatryNav />

            <Card className="p-4">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            placeholder="Search by patient, medication name, or indication..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="pl-10"
                        />
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
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Assessment Date</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Medication</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Dose / Frequency</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Side Effects</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Loading medications...
                                    </td>
                                </tr>
                            ) : medications.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No medications found
                                    </td>
                                </tr>
                            ) : (
                                medications.map((medication) => (
                                    <tr key={medication.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">
                                                {medication.patient
                                                    ? `${medication.patient.firstName} ${medication.patient.lastName}`
                                                    : medication.patientId}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {medication.patient?.mrn || medication.patientId}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {formatDateTime(medication.assessmentDate)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            <div className="font-medium">{medication.medicationName}</div>
                                            {medication.genericName && (
                                                <div className="text-xs text-gray-500">{medication.genericName}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {medication.dose} / {medication.frequency}
                                        </td>
                                        <td className="px-6 py-4">
                                            {medication.sideEffectsPresent ? (
                                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                                                    Yes
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                                                    None
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link to={`/psychiatry/medications/${medication.id}/edit`}>
                                                    <Button variant="outline" size="sm">
                                                        <Pencil size={16} />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(medication)}
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
                            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} medications
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
