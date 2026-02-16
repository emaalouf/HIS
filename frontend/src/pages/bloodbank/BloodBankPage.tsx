import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { bloodProductService } from '../../services/bloodProduct.service';
import { Button, Card, Input } from '../../components/ui';
import { Plus, Search, Droplet, AlertTriangle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import type { BloodProduct, BloodProductType, BloodProductStatus, BloodTypeBB } from '../../types';

const productTypes: BloodProductType[] = [
  'WHOLE_BLOOD', 'PRBC', 'FFP', 'PLATELETS', 'CRYOPRECIPITATE', 'GRANULOCYTES', 'ALBUMIN', 'IVIG'
];

const bloodTypes: BloodTypeBB[] = [
  'A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 
  'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'
];

const statusOptions: BloodProductStatus[] = [
  'AVAILABLE', 'RESERVED', 'QUARANTINE', 'EXPIRED', 'DISCARDED', 'TRANSFUSED'
];

const statusStyles: Record<BloodProductStatus, string> = {
  AVAILABLE: 'bg-green-100 text-green-700',
  RESERVED: 'bg-blue-100 text-blue-700',
  QUARANTINE: 'bg-yellow-100 text-yellow-700',
  EXPIRED: 'bg-red-100 text-red-700',
  DISCARDED: 'bg-gray-100 text-gray-500',
  TRANSFUSED: 'bg-purple-100 text-purple-700',
};

const formatProductType = (type: string) => {
  return type.replace(/_/g, ' ');
};

const formatBloodType = (type: string) => {
  return type.replace('_', ' ').replace('POSITIVE', '+').replace('NEGATIVE', '-');
};

export function BloodBankPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [productType, setProductType] = useState<BloodProductType | ''>('');
  const [bloodType, setBloodType] = useState<BloodTypeBB | ''>('');
  const [status, setStatus] = useState<BloodProductStatus | ''>('');
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['blood-products', page, search, productType, bloodType, status],
    queryFn: () =>
      bloodProductService.getBloodProducts({
        page,
        limit,
        search,
        productType: productType || undefined,
        bloodType: bloodType || undefined,
        status: status || undefined,
      }),
  });

  const { data: inventory } = useQuery({
    queryKey: ['blood-inventory'],
    queryFn: () => bloodProductService.getInventoryByBloodType(),
  });

  const { data: expiringProducts } = useQuery({
    queryKey: ['expiring-blood-products'],
    queryFn: () => bloodProductService.getExpiringProducts(7),
  });

  const { data: lowStock } = useQuery({
    queryKey: ['low-stock-blood-products'],
    queryFn: () => bloodProductService.getLowStockProducts(10),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const products = data?.products ?? [];
  const pagination = data?.pagination;

  // Group inventory by blood type for display
  const inventoryByBloodType = inventory?.reduce((acc, item) => {
    if (!acc[item.bloodType]) {
      acc[item.bloodType] = {};
    }
    acc[item.bloodType][item.productType] = item._count.id;
    return acc;
  }, {} as Record<string, Record<string, number>>) || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blood Bank</h1>
          <p className="text-gray-500 mt-1">Blood inventory management, cross-matching, and transfusions.</p>
        </div>
        <Link to="/bloodbank/products/new">
          <Button>
            <Plus size={18} className="mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Inventory Dashboard */}
      {inventory && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Blood Inventory by Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {bloodTypes.map((bt) => (
              <div key={bt} className="p-3 bg-gray-50 rounded-lg">
                <p className="font-semibold text-lg">{formatBloodType(bt)}</p>
                <p className="text-sm text-gray-600">
                  Units: {Object.values(inventoryByBloodType[bt] || {}).reduce((a, b) => a + b, 0)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {expiringProducts && expiringProducts.length > 0 && (
          <Card className="p-4 border-red-300">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="text-red-600" size={20} />
              <h3 className="font-semibold text-red-900">Expiring Soon ({expiringProducts.length})</h3>
            </div>
            <p className="text-sm text-red-700">Products expiring within 7 days</p>
          </Card>
        )}

        {lowStock && lowStock.length > 0 && (
          <Card className="p-4 border-amber-300">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="text-amber-600" size={20} />
              <h3 className="font-semibold text-amber-900">Low Stock ({lowStock.length})</h3>
            </div>
            <p className="text-sm text-amber-700">Products below minimum threshold</p>
          </Card>
        )}
      </div>

      {/* Search Filters */}
      <Card className="p-4">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Search by product code or storage location..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={productType}
            onChange={(e) => {
              setProductType(e.target.value as BloodProductType);
              setPage(1);
            }}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="">All Types</option>
            {productTypes.map((t) => (
              <option key={t} value={t}>{formatProductType(t)}</option>
            ))}
          </select>
          <select
            value={bloodType}
            onChange={(e) => {
              setBloodType(e.target.value as BloodTypeBB);
              setPage(1);
            }}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="">All Blood Types</option>
            {bloodTypes.map((t) => (
              <option key={t} value={t}>{formatBloodType(t)}</option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as BloodProductStatus);
              setPage(1);
            }}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="">All Statuses</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
      </Card>

      {/* Products Table */}
      <Card>
        {isLoading ? (
          <div className="p-8 text-center">Loading blood products...</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No blood products found. Add your first product to get started.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Product Code</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Blood Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Volume</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Expires</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map((product: BloodProduct) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">
                        {product.productCode}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatProductType(product.productType)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Droplet size={16} className="text-red-500" />
                          <span className="font-medium">{formatBloodType(product.bloodType)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {product.volume} mL
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusStyles[product.status]}`}>
                          {product.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(product.expirationDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/bloodbank/products/${product.id}`}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="View Details"
                          >
                            <Droplet size={16} />
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
