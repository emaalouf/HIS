import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { qcControlService } from '../../services/qcControl.service';
import { Card, Button } from '../../components/ui';
import { Activity, TrendingUp, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { LISNav } from './LISNav';
import type { QCControl, QCControlLevel } from '../../types';

const levelStyles: Record<QCControlLevel, string> = {
  NORMAL: 'bg-green-100 text-green-700',
  ABNORMAL_LOW: 'bg-amber-100 text-amber-700',
  ABNORMAL_HIGH: 'bg-red-100 text-red-700',
};

export function QCControlsPage() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: stats } = useQuery({
    queryKey: ['qc-stats'],
    queryFn: () => qcControlService.getStats(),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['qc-controls', page],
    queryFn: () => qcControlService.getQCControls({ page, limit }),
  });

  const controls = data?.controls ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">QC & QA</h1>
          <p className="text-gray-500 mt-1">Quality control management and Levey-Jennings charts.</p>
        </div>
        <Button>
          <Plus size={18} className="mr-2" />
          Add QC Control
        </Button>
      </div>

      <LISNav />

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">QC Runs Today</p>
                <p className="text-2xl font-bold">{stats.today}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pass Rate</p>
                <p className="text-2xl font-bold">
                  {stats.byStatus.find(s => s.status === 'PASS')?._count.id || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="text-red-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Recent Failures</p>
                <p className="text-2xl font-bold text-red-600">{stats.recentFailures}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 rounded-lg">
                <TrendingUp className="text-amber-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Expiring Controls</p>
                <p className="text-2xl font-bold text-amber-600">{stats.expiringControls}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Card>
        <h2 className="text-lg font-semibold p-4 border-b">QC Controls</h2>
        
        {isLoading ? (
          <div className="p-8 text-center">Loading controls...</div>
        ) : controls.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No QC controls configured. Add controls to track quality.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Test</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Lot Number</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Level</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Target Value</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Acceptable Range</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Expiry Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {controls.map((control: QCControl) => (
                    <tr key={control.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {control.test?.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {control.lotNumber}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${levelStyles[control.level]}`}
                        >
                          {control.level.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {control.targetValue}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        ±{control.acceptableRange}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(control.expiryDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            control.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {control.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Button variant="secondary" size="sm">
                          View Chart
                        </Button>
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
