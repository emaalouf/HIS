import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { edVisitService } from '../../services/edVisit.service';
import { Button, Card, Input } from '../../components/ui';
import { Plus, Search, Activity, AlertCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import type { EDVisit, EDVisitStatus, ESI } from '../../types';

const statusOptions: EDVisitStatus[] = [
  'PENDING', 'TRIAGE', 'IN_PROGRESS', 'UNDER_OBSERVATION', 
  'WAITING_RESULTS', 'READY_FOR_DISCHARGE', 'DISCHARGED', 
  'ADMITTED', 'TRANSFERRED', 'LEFT_WITHOUT_BEING_SEEN', 'DECEASED'
];

const esiLevels: ESI[] = ['ESI_1', 'ESI_2', 'ESI_3', 'ESI_4', 'ESI_5'];

const statusStyles: Record<EDVisitStatus, string> = {
  PENDING: 'bg-gray-100 text-gray-700',
  TRIAGE: 'bg-yellow-100 text-yellow-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  UNDER_OBSERVATION: 'bg-purple-100 text-purple-700',
  WAITING_RESULTS: 'bg-orange-100 text-orange-700',
  READY_FOR_DISCHARGE: 'bg-green-100 text-green-700',
  DISCHARGED: 'bg-gray-100 text-gray-500',
  ADMITTED: 'bg-green-100 text-green-700',
  TRANSFERRED: 'bg-blue-100 text-blue-700',
  LEFT_WITHOUT_BEING_SEEN: 'bg-red-100 text-red-700',
  DECEASED: 'bg-red-100 text-red-700',
};

const esiStyles: Record<ESI, string> = {
  ESI_1: 'bg-red-600 text-white',
  ESI_2: 'bg-orange-500 text-white',
  ESI_3: 'bg-yellow-400 text-gray-900',
  ESI_4: 'bg-green-500 text-white',
  ESI_5: 'bg-blue-500 text-white',
};

const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

const formatESI = (esi: string) => {
  return esi.replace('_', ' ');
};

const calculateWaitTime = (arrivalTime: string) => {
  const arrival = new Date(arrivalTime);
  const now = new Date();
  const diffMs = now.getTime() - arrival.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return `${hours}h ${mins}m`;
};

export function EmergencyDepartmentPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState<EDVisitStatus | ''>('');
  const [triageLevel, setTriageLevel] = useState<ESI | ''>('');
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['ed-visits', page, search, status, triageLevel],
    queryFn: () =>
      edVisitService.getEDVisits({
        page,
        limit,
        search,
        status: status || undefined,
        triageLevel: triageLevel || undefined,
      }),
  });

  const { data: stats } = useQuery({
    queryKey: ['ed-visit-stats'],
    queryFn: () => edVisitService.getStats(),
  });

  const { data: activeVisits } = useQuery({
    queryKey: ['active-ed-visits'],
    queryFn: () => edVisitService.getActiveVisits(),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const visits = data?.visits ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Emergency Department</h1>
          <p className="text-gray-500 mt-1">ED tracking board, triage, and patient flow management.</p>
        </div>
        <Link to="/emergency/new">
          <Button>
            <Plus size={18} className="mr-2" />
            New ED Visit
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
                <AlertCircle className="text-red-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">ESI 1 (Critical)</p>
                <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Clock className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Today</p>
                <p className="text-2xl font-bold">{stats.today}</p>
              </div>
            </div>
          </Card>

          {stats.byStatus.slice(0, 1).map((stat, idx) => (
            <Card key={idx} className="p-4">
              <p className="text-sm text-gray-500">{formatStatus(stat.status)}</p>
              <p className="text-2xl font-bold">{stat._count.id}</p>
            </Card>
          ))}
        </div>
      )}

      {activeVisits && activeVisits.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Active ED Board</h3>
          <div className="grid gap-3">
            {activeVisits.slice(0, 5).map((visit: EDVisit) => (
              <div key={visit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded ${visit.triageLevel ? esiStyles[visit.triageLevel] : 'bg-gray-200'}`}>
                    {visit.triageLevel ? formatESI(visit.triageLevel) : 'Not Triaged'}
                  </span>
                  <div>
                    <p className="font-medium">{visit.patient?.firstName} {visit.patient?.lastName}</p>
                    <p className="text-sm text-gray-500">{visit.chiefComplaint.substring(0, 50)}...</p>
                  </div>
                  
                  <span className={`px-2 py-1 text-xs rounded-full ${statusStyles[visit.currentStatus]}`}>
                    {formatStatus(visit.currentStatus)}
                  </span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">Wait: {calculateWaitTime(visit.arrivalTime)}</p>
                    <p className="text-xs text-gray-500">{visit.bedAssignment || 'No Bed'}</p>
                  </div>
                  
                  <Link
                    to={`/emergency/visits/${visit.id}`}
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
              placeholder="Search by visit number, patient name, or MRN..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as EDVisitStatus);
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
            value={triageLevel}
            onChange={(e) => {
              setTriageLevel(e.target.value as ESI);
              setPage(1);
            }}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="">All ESI Levels</option>
            {esiLevels.map((level) => (
              <option key={level} value={level}>{formatESI(level)}</option>
            ))}
          </select>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
      </Card>

      <Card>
        {isLoading ? (
          <div className="p-8 text-center">Loading ED visits...</div>
        ) : visits.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No ED visits found. Register your first patient to get started.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Visit #</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">ESI</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Patient</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Chief Complaint</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Arrival</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Wait Time</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Bed</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {visits.map((visit: EDVisit) => (
                    <tr key={visit.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">
                        {visit.visitNumber}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {visit.triageLevel ? (
                          <span className={`inline-flex px-2 py-1 text-xs font-bold rounded ${esiStyles[visit.triageLevel]}`}>
                            {formatESI(visit.triageLevel)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {visit.patient ? (
                          <div>
                            <p className="font-medium text-gray-900">
                              {visit.patient.firstName} {visit.patient.lastName}
                            </p>
                            <p className="text-gray-500 text-xs">{visit.patient.mrn}</p>
                          </div>
                        ) : (
                          'Unknown'
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                        {visit.chiefComplaint}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusStyles[visit.currentStatus]}`}>
                          {formatStatus(visit.currentStatus)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div>
                          <p>{new Date(visit.arrivalTime).toLocaleDateString()}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(visit.arrivalTime).toLocaleTimeString()}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {calculateWaitTime(visit.arrivalTime)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {visit.bedAssignment || 'Not assigned'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/emergency/visits/${visit.id}`}
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
