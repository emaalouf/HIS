import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { labResultService } from '../../services/labResult.service';
import { Button, Card, Input } from '../../components/ui';
import { Search, ChevronLeft, ChevronRight, AlertTriangle, Eye } from 'lucide-react';
import type { LabResult, LabResultStatus, LabResultFlag } from '../../types';
import { LISNav } from './LISNav';

const statusOptions: LabResultStatus[] = ['PENDING', 'PRELIMINARY', 'FINAL', 'AMENDED', 'CANCELLED'];

const flagOptions: LabResultFlag[] = ['NORMAL', 'LOW', 'HIGH', 'CRITICAL_LOW', 'CRITICAL_HIGH', 'BORDERLINE'];

const statusStyles: Record<LabResultStatus, string> = {
  PENDING: 'bg-gray-100 text-gray-700',
  PRELIMINARY: 'bg-amber-100 text-amber-700',
  FINAL: 'bg-green-100 text-green-700',
  AMENDED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const flagStyles: Record<LabResultFlag, string> = {
  NORMAL: 'bg-green-100 text-green-700',
  LOW: 'bg-amber-100 text-amber-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL_LOW: 'bg-red-100 text-red-700',
  CRITICAL_HIGH: 'bg-red-100 text-red-700',
  BORDERLINE: 'bg-yellow-100 text-yellow-700',
};

const formatStatus = (status: string) => {
  return status.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

const formatFlag = (flag: string) => {
  return flag.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

export function LabResultsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState<LabResultStatus | ''>('');
  const [flag, setFlag] = useState<LabResultFlag | ''>('');
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['lab-results', page, search, status, flag],
    queryFn: () =>
      labResultService.getResults({
        page,
        limit,
        search,
        status: status || undefined,
        flag: flag || undefined,
      }),
  });

  const { data: stats } = useQuery({
    queryKey: ['lab-result-stats'],
    queryFn: () => labResultService.getStats(),
  });

  const { data: criticalResults } = useQuery({
    queryKey: ['critical-results'],
    queryFn: () => labResultService.getCriticalResults(),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const results = data?.results ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lab Results</h1>
          <p className="text-gray-500 mt-1">View and manage laboratory test results.</p>
        </div>
      </div>

      <LISNav />

      {criticalResults && criticalResults.length > 0 && (
        <Card className="p-4 border-red-300 bg-red-50">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="text-red-600" size={20} />
            <h3 className="font-semibold text-red-900">Critical Results ({criticalResults.length})</h3>
          </div>
          <div className="space-y-2">
            {criticalResults.slice(0, 3).map((result: LabResult) => (
              <div key={result.id} className="flex items-center justify-between p-2 bg-white rounded border">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{result.patient?.firstName} {result.patient?.lastName}</span>
                  <span className="text-sm text-gray-500">{result.test?.name}</span>
                  <span className="px-2 py-1 text-xs font-bold bg-red-100 text-red-700 rounded">
                    {result.value} {result.unit}
                  </span>
                </div>
                <Link
                  to={`/lis/results/${result.id}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  View
                </Link>
              </div>
            ))}
            {criticalResults.length > 3 && (
              <p className="text-sm text-red-600">+ {criticalResults.length - 3} more critical results</p>
            )}
          </div>
        </Card>
      )}

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-gray-500">Results Today</p>
            <p className="text-2xl font-bold">{stats.today}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-500">Critical</p>
            <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
          </Card>
          {stats.byStatusAndFlag.slice(0, 2).map((stat, idx) => (
            <Card key={idx} className="p-4">
              <p className="text-sm text-gray-500">{formatStatus(stat.status)} - {formatFlag(stat.flag)}</p>
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
              placeholder="Search by patient name, MRN, or test name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as LabResultStatus);
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
            value={flag}
            onChange={(e) => {
              setFlag(e.target.value as LabResultFlag);
              setPage(1);
            }}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="">All Flags</option>
            {flagOptions.map((f) => (
              <option key={f} value={f}>{formatFlag(f)}</option>
            ))}
          </select>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
      </Card>

      <Card>
        {isLoading ? (
          <div className="p-8 text-center">Loading results...</div>
        ) : results.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No results found.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Patient</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Test</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Result</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Flag</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Resulted</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {results.map((result: LabResult) => (
                    <tr key={result.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        {result.patient ? (
                          <div>
                            <p className="font-medium text-gray-900">
                              {result.patient.firstName} {result.patient.lastName}
                            </p>
                            <p className="text-gray-500 text-xs">{result.patient.mrn}</p>
                          </div>
                        ) : (
                          'Unknown'
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {result.test?.name}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="font-medium">{result.value}</span>
                        {result.unit && <span className="text-gray-500 ml-1">{result.unit}</span>}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${flagStyles[result.flag]}`}
                        >
                          {formatFlag(result.flag)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusStyles[result.status]}`}
                        >
                          {formatStatus(result.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {result.resultedAt ? (
                          <div>
                            <p>{new Date(result.resultedAt).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(result.resultedAt).toLocaleTimeString()}
                            </p>
                          </div>
                        ) : (
                          'Pending'
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/lis/results/${result.id}`}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="View Details"
                          >
                            <Eye size={16} />
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
