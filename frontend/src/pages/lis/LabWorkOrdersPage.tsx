import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { labWorkOrderService } from '../../services/labWorkOrder.service';
import { Button, Card, Input } from '../../components/ui';
import { Plus, Search, FileText, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import type { LabWorkOrder, LabWorkOrderStatus, OrderPriority } from '../../types';
import { LISNav } from './LISNav';

const statusOptions: LabWorkOrderStatus[] = [
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'REJECTED',
];

const priorityOptions: OrderPriority[] = ['ROUTINE', 'URGENT', 'STAT'];

const statusStyles: Record<LabWorkOrderStatus, string> = {
  PENDING: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  REJECTED: 'bg-red-100 text-red-700',
};

const priorityStyles: Record<OrderPriority, string> = {
  ROUTINE: 'bg-gray-100 text-gray-700',
  URGENT: 'bg-amber-100 text-amber-700',
  STAT: 'bg-red-100 text-red-700',
};

const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

export function LabWorkOrdersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState<LabWorkOrderStatus | ''>('');
  const [priority, setPriority] = useState<OrderPriority | ''>('');
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['lab-work-orders', page, search, status, priority],
    queryFn: () =>
      labWorkOrderService.getWorkOrders({
        page,
        limit,
        search,
        status: status || undefined,
        priority: priority || undefined,
      }),
  });

  const { data: stats } = useQuery({
    queryKey: ['work-order-stats'],
    queryFn: () => labWorkOrderService.getStats(),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const workOrders = data?.workOrders ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Work Orders</h1>
          <p className="text-gray-500 mt-1">Manage laboratory work orders and track test processing.</p>
        </div>
        <Link to="/lis/work-orders/new">
          <Button>
            <Plus size={18} className="mr-2" />
            New Work Order
          </Button>
        </Link>
      </div>

      <LISNav />

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-gray-500">Today</p>
            <p className="text-2xl font-bold">{stats.today}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-500">Pending STAT</p>
            <p className="text-2xl font-bold text-red-600">{stats.pendingSTAT}</p>
          </Card>
          {stats.byStatusAndPriority.slice(0, 2).map((stat, idx) => (
            <Card key={idx} className="p-4">
              <p className="text-sm text-gray-500">{formatStatus(stat.status)} - {stat.priority}</p>
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
              placeholder="Search by order number, patient name, or MRN..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as LabWorkOrderStatus);
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
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value as OrderPriority);
              setPage(1);
            }}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="">All Priorities</option>
            {priorityOptions.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
      </Card>

      <Card>
        {isLoading ? (
          <div className="p-8 text-center">Loading work orders...</div>
        ) : workOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No work orders found. Create your first work order to get started.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Order #</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Patient</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Priority</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ordered</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Results</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {workOrders.map((order: LabWorkOrder) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">
                        {order.orderNumber}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {order.patient ? (
                          <div>
                            <p className="font-medium text-gray-900">
                              {order.patient.firstName} {order.patient.lastName}
                            </p>
                            <p className="text-gray-500 text-xs">{order.patient.mrn}</p>
                          </div>
                        ) : (
                          'Unknown'
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${priorityStyles[order.priority]}`}
                        >
                          {order.priority === 'STAT' && <AlertCircle size={12} className="mr-1" />}
                          {order.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusStyles[order.status]}`}
                        >
                          {formatStatus(order.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div>
                          <p>{new Date(order.orderedAt).toLocaleDateString()}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.orderedAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {order._count?.results || 0} / {order.items?.length || 0}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/lis/work-orders/${order.id}`}
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
