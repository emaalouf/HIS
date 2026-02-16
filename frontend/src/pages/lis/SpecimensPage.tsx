import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { specimenService } from '../../services/specimen.service';
import { Button, Card, Input } from '../../components/ui';
import { Plus, Search, QrCode, ChevronLeft, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import type { Specimen, SpecimenStatus, SpecimenType } from '../../types';
import { LISNav } from './LISNav';

const specimenTypes: SpecimenType[] = [
  'BLOOD',
  'SERUM',
  'PLASMA',
  'URINE',
  'STOOL',
  'CSF',
  'SPUTUM',
  'SWAB',
  'TISSUE',
  'FLUID',
  'BONE_MARROW',
  'OTHER',
];

const statusOptions: SpecimenStatus[] = [
  'ORDERED',
  'COLLECTED',
  'RECEIVED',
  'PROCESSING',
  'COMPLETED',
  'REJECTED',
];

const statusStyles: Record<SpecimenStatus, string> = {
  ORDERED: 'bg-gray-100 text-gray-700',
  COLLECTED: 'bg-blue-100 text-blue-700',
  RECEIVED: 'bg-amber-100 text-amber-700',
  PROCESSING: 'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

const formatSpecimenType = (type: string) => {
  return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

export function SpecimensPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState<SpecimenStatus | ''>('');
  const [specimenType, setSpecimenType] = useState<SpecimenType | ''>('');
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['specimens', page, search, status, specimenType],
    queryFn: () =>
      specimenService.getSpecimens({
        page,
        limit,
        search,
        status: status || undefined,
        specimenType: specimenType || undefined,
      }),
  });

  const { data: stats } = useQuery({
    queryKey: ['specimen-stats'],
    queryFn: () => specimenService.getStats(),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const specimens = data?.specimens ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Specimens</h1>
          <p className="text-gray-500 mt-1">Track specimen collection, receipt, and processing.</p>
        </div>
        <Link to="/lis/specimens/new">
          <Button>
            <Plus size={18} className="mr-2" />
            Collect Specimen
          </Button>
        </Link>
      </div>

      <LISNav />

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.byStatus.map((stat) => (
            <Card key={stat.status} className="p-4">
              <p className="text-sm text-gray-500">{formatStatus(stat.status)}</p>
              <p className="text-2xl font-bold">{stat._count.id}</p>
            </Card>
          ))}
        </div>
      )}

      <Card className="p-4">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Search by barcode, patient name, or MRN..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as SpecimenStatus);
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
            value={specimenType}
            onChange={(e) => {
              setSpecimenType(e.target.value as SpecimenType);
              setPage(1);
            }}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="">All Types</option>
            {specimenTypes.map((type) => (
              <option key={type} value={type}>{formatSpecimenType(type)}</option>
            ))}
          </select>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
      </Card>

      <Card>
        {isLoading ? (
          <div className="p-8 text-center">Loading specimens...</div>
        ) : specimens.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No specimens found. Collect your first specimen to get started.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Barcode</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Patient</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Collected</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {specimens.map((specimen: Specimen) => (
                    <tr key={specimen.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">
                        {specimen.barcode}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {specimen.patient ? (
                          <div>
                            <p className="font-medium text-gray-900">
                              {specimen.patient.firstName} {specimen.patient.lastName}
                            </p>
                            <p className="text-gray-500 text-xs">{specimen.patient.mrn}</p>
                          </div>
                        ) : (
                          'Unknown'
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatSpecimenType(specimen.specimenType)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div>
                          <p>{new Date(specimen.collectionTime).toLocaleDateString()}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(specimen.collectionTime).toLocaleTimeString()}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusStyles[specimen.status]}`}
                        >
                          {formatStatus(specimen.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/lis/specimens/${specimen.id}`}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="View Details"
                          >
                            <QrCode size={16} />
                          </Link>
                          {specimen.status === 'COLLECTED' && (
                            <button
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Receive Specimen"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          {(specimen.status === 'ORDERED' || specimen.status === 'COLLECTED') && (
                            <button
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Reject Specimen"
                            >
                              <XCircle size={16} />
                            </button>
                          )}
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
