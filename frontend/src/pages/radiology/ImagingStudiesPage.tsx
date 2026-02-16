import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { imagingStudyService } from '../../services/imagingStudy.service';
import { Button, Card, Input } from '../../components/ui';
import { Plus, Search, FileText, ChevronLeft, ChevronRight, AlertCircle, Activity } from 'lucide-react';
import type { ImagingStudy, ImagingStudyStatus, ImagingModality, OrderPriority } from '../../types';

const modalities: ImagingModality[] = [
  'XRAY', 'CT', 'MRI', 'ULTRASOUND', 'MAMMOGRAPHY', 
  'FLUOROSCOPY', 'PET', 'NUCLEAR_MEDICINE', 'ANGIOGRAPHY', 'DEXA'
];

const statusOptions: ImagingStudyStatus[] = [
  'ORDERED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
];

const priorityOptions: OrderPriority[] = ['ROUTINE', 'URGENT', 'STAT'];

const statusStyles: Record<ImagingStudyStatus, string> = {
  ORDERED: 'bg-gray-100 text-gray-700',
  SCHEDULED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const priorityStyles: Record<OrderPriority, string> = {
  ROUTINE: 'bg-gray-100 text-gray-700',
  URGENT: 'bg-amber-100 text-amber-700',
  STAT: 'bg-red-100 text-red-700',
};

const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

const formatModality = (modality: string) => {
  return modality.replace(/_/g, ' ');
};

export function ImagingStudiesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState<ImagingStudyStatus | ''>('');
  const [modality, setModality] = useState<ImagingModality | ''>('');
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['imaging-studies', page, search, status, modality],
    queryFn: () =>
      imagingStudyService.getImagingStudies({
        page,
        limit,
        search,
        status: status || undefined,
        modality: modality || undefined,
      }),
  });

  const { data: stats } = useQuery({
    queryKey: ['imaging-study-stats'],
    queryFn: () => imagingStudyService.getStats(),
  });

  const { data: pendingStudies } = useQuery({
    queryKey: ['pending-imaging-studies'],
    queryFn: () => imagingStudyService.getPendingStudies(),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const studies = data?.studies ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Radiology / PACS</h1>
          <p className="text-gray-500 mt-1">Manage imaging studies, DICOM data, and radiologist reports.</p>
        </div>
        <Link to="/radiology/studies/new">
          <Button>
            <Plus size={18} className="mr-2" />
            New Study
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
                <p className="text-sm text-gray-500">Studies Today</p>
                <p className="text-2xl font-bold">{stats.today}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="text-red-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending STAT</p>
                <p className="text-2xl font-bold text-red-600">{stats.pendingSTAT}</p>
              </div>
            </div>
          </Card>
          {stats.byStatusAndModality.slice(0, 2).map((stat, idx) => (
            <Card key={idx} className="p-4">
              <p className="text-sm text-gray-500">{formatStatus(stat.status)} - {formatModality(stat.modality)}</p>
              <p className="text-2xl font-bold">{stat._count.id}</p>
            </Card>
          ))}
        </div>
      )}

      {pendingStudies && pendingStudies.length > 0 && (
        <Card className="p-4 border-amber-300">
          <h3 className="font-semibold text-amber-900 mb-3">Pending Studies ({pendingStudies.length})</h3>
          <div className="space-y-2">
            {pendingStudies.slice(0, 3).map((study: ImagingStudy) => (
              <div key={study.id} className="flex items-center justify-between p-2 bg-amber-50 rounded border">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{study.patient?.firstName} {study.patient?.lastName}</span>
                  <span className="text-sm text-gray-500">{formatModality(study.modality)}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityStyles[study.priority]}`}>
                    {study.priority}
                  </span>
                </div>
                <Link
                  to={`/radiology/studies/${study.id}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  View
                </Link>
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
              placeholder="Search by accession number, patient name, or MRN..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as ImagingStudyStatus);
              setPage(1);
            }}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="">All Statuses</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>{formatStatus(s)}</option>
            ))}
          </select>
          <select
            value={modality}
            onChange={(e) => {
              setModality(e.target.value as ImagingModality);
              setPage(1);
            }}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="">All Modalities</option>
            {modalities.map((m) => (
              <option key={m} value={m}>{formatModality(m)}</option>
            ))}
          </select>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
      </Card>

      <Card>
        {isLoading ? (
          <div className="p-8 text-center">Loading imaging studies...</div>
        ) : studies.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No imaging studies found. Create your first study to get started.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Accession #</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Patient</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Modality</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Priority</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Scheduled</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {studies.map((study: ImagingStudy) => (
                    <tr key={study.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">
                        {study.accessionNumber}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {study.patient ? (
                          <div>
                            <p className="font-medium text-gray-900">
                              {study.patient.firstName} {study.patient.lastName}
                            </p>
                            <p className="text-gray-500 text-xs">{study.patient.mrn}</p>
                          </div>
                        ) : (
                          'Unknown'
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatModality(study.modality)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${priorityStyles[study.priority]}`}
                        >
                          {study.priority === 'STAT' && <AlertCircle size={12} className="mr-1" />}
                          {study.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusStyles[study.status]}`}
                        >
                          {formatStatus(study.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {study.scheduledDate ? (
                          <div>
                            <p>{new Date(study.scheduledDate).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(study.scheduledDate).toLocaleTimeString()}
                            </p>
                          </div>
                        ) : (
                          'Not scheduled'
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/radiology/studies/${study.id}`}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="View Details"
                          >
                            <FileText size={16} />
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
