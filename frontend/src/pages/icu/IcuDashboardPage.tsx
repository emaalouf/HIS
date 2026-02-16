import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { icuAdmissionService } from '../../services/icuAdmission.service';
import { Button, Card, Input } from '../../components/ui';
import { Plus, Search, Activity, Wind, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import type { IcuAdmission, IcuAdmissionStatus, IcuAdmissionSource } from '../../types';

const statusOptions: IcuAdmissionStatus[] = [
  'ADMITTED', 'CRITICAL', 'STABLE', 'IMPROVING', 'DETERIORATING', 'DISCHARGED', 'DECEASED'
];

const sourceOptions: IcuAdmissionSource[] = [
  'ED', 'OR', 'WARD', 'ANOTHER_HOSPITAL', 'DIRECT_ADMISSION'
];

const statusStyles: Record<IcuAdmissionStatus, string> = {
  ADMITTED: 'bg-blue-100 text-blue-700',
  CRITICAL: 'bg-red-100 text-red-700',
  STABLE: 'bg-green-100 text-green-700',
  IMPROVING: 'bg-emerald-100 text-emerald-700',
  DETERIORATING: 'bg-orange-100 text-orange-700',
  DISCHARGED: 'bg-gray-100 text-gray-500',
  DECEASED: 'bg-gray-100 text-gray-500',
};

const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

export function IcuDashboardPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState<IcuAdmissionStatus | ''>('');
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['icu-admissions', page, search, status],
    queryFn: () =>
      icuAdmissionService.getIcuAdmissions({
        page,
        limit,
        search,
        status: status || undefined,
      }),
  });

  const { data: stats } = useQuery({
    queryKey: ['icu-admission-stats'],
    queryFn: () => icuAdmissionService.getStats(),
  });

  const { data: activeAdmissions } = useQuery({
    queryKey: ['active-icu-admissions'],
    queryFn: () => icuAdmissionService.getActiveAdmissions(),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const admissions = data?.admissions ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ICU / Critical Care</h1>
          <p className="text-gray-500 mt-1">Intensive care unit management and monitoring.</p>
        </div>
        <Link to="/icu/admissions/new">
          <Button>
            <Plus size={18} className="mr-2" />
            New Admission
          </Button>
        </Link>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Patients</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="text-red-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Critical</p>
                <p className="text-2xl font-bold text-red-600">{stats.byStatus.find(s => s.status === 'CRITICAL')?._count.id || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Wind className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Ventilated</p>
                <p className="text-2xl font-bold">{stats.ventilated}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Activity className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Today</p>
                <p className="text-2xl font-bold">{stats.today}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeAdmissions && activeAdmissions.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Active ICU Patients ({activeAdmissions.length})</h3>
          <div className="grid gap-3">
            {activeAdmissions.slice(0, 5).map((admission: IcuAdmission) => (
              <div key={admission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[admission.currentStatus]}`}>
                    {formatStatus(admission.currentStatus)}
                  </span>
                  <div>
                    <p className="font-medium">{admission.patient?.firstName} {admission.patient?.lastName}</p>
                    <p className="text-sm text-gray-500">{admission.primaryDiagnosis.substring(0, 50)}...</p>
                  </div>
                  
                  {admission.isVentilated && (
                    <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">Ventilated</span>
                  )}
                  
                  {admission.isSedated && (
                    <span className="px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded">Sedated</span>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  <p className="text-sm text-gray-500">{admission.bedNumber || 'No Bed'}</p>
                  <Link
                    to={`/icu/admissions/${admission.id}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-4">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Search by admission number, patient name, or MRN..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as IcuAdmissionStatus);
              setPage(1);
            }}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="">All Statuses</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>{formatStatus(s)}</option>
            ))}
          </select>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
      </Card>

      <Card>
        {isLoading ? (
          <div className="p-8 text-center">Loading ICU admissions...</div>
        ) : admissions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No ICU admissions found. Create your first admission to get started.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Admission #</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Patient</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Diagnosis</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Bed</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Admitted</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {admissions.map((admission: IcuAdmission) => (
                    <tr key={admission.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">
                        {admission.admissionNumber}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusStyles[admission.currentStatus]}`}>
                          {formatStatus(admission.currentStatus)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {admission.patient ? (
                          <div>
                            <p className="font-medium text-gray-900">
                              {admission.patient.firstName} {admission.patient.lastName}
                            </p>
                            <p className="text-gray-500 text-xs">{admission.patient.mrn}</p>
                          </div>
                        ) : (
                          'Unknown'
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                        {admission.primaryDiagnosis}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {admission.bedNumber || 'Not assigned'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div>
                          <p>{new Date(admission.admissionDate).toLocaleDateString()}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(admission.admissionDate).toLocaleTimeString()}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/icu/admissions/${admission.id}`}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="View Details"
                          >
                            <Activity size={16} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <div className="text-sm text-gray-500">
                  Showing {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.totalPages}
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
