import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { patientService } from '../../services/patient.service';
import { Button, Input, Card } from '../../components/ui';
import { calculateAge, formatBloodType } from '../../lib/utils';
import { Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';

export function PatientListPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const limit = 10;

    const { data, isLoading } = useQuery({
        queryKey: ['patients', page, search],
        queryFn: () => patientService.getPatients({ page, limit, search }),
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
                    <p className="text-gray-500 mt-1">Manage patient records and medical history</p>
                </div>
                <Link to="/patients/new">
                    <Button>
                        <Plus size={18} className="mr-2" />
                        Add Patient
                    </Button>
                </Link>
            </div>

            {/* Search */}
            <Card className="p-4">
                <form onSubmit={handleSearch} className="flex gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            placeholder="Search by name, MRN, or phone..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button type="submit">Search</Button>
                </form>
            </Card>

            {/* Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Patient</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">MRN</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Age/Gender</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Blood Type</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Phone</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Loading...
                                    </td>
                                </tr>
                            ) : data?.patients.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No patients found
                                    </td>
                                </tr>
                            ) : (
                                data?.patients.map((patient) => (
                                    <tr key={patient.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <Link to={`/patients/${patient.id}`} className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                                                    {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 hover:text-blue-600">
                                                        {patient.firstName} {patient.lastName}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{patient.email || '-'}</p>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                                            {patient.mrn}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {calculateAge(patient.dateOfBirth)}y / {patient.gender.charAt(0)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <span className="px-2 py-1 bg-red-50 text-red-700 rounded-md text-xs font-medium">
                                                {formatBloodType(patient.bloodType)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {patient.phone}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${patient.isActive
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {patient.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {data?.pagination && data.pagination.totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, data.pagination.total)} of {data.pagination.total} patients
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
                                onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                                disabled={page === data.pagination.totalPages}
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
