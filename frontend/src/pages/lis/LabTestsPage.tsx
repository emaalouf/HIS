import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { labTestService } from '../../services/labTest.service';
import { Button, Card, Input } from '../../components/ui';
import { Plus, Search, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';
import type { LabTest, LabTestCategory, SpecimenType } from '../../types';
import { LISNav } from './LISNav';

const categories: LabTestCategory[] = [
  'HEMATOLOGY',
  'CHEMISTRY',
  'MICROBIOLOGY',
  'SEROLOGY',
  'IMMUNOLOGY',
  'MOLECULAR',
  'ENDOCRINOLOGY',
  'TOXICOLOGY',
  'URINALYSIS',
  'COAGULATION',
  'HISTOLOGY',
  'CYTOLOGY',
  'OTHER',
];

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

const formatCategory = (category: string) => {
  return category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

const formatSpecimenType = (type: string) => {
  return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

export function LabTestsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState<LabTestCategory | ''>('');
  const [specimenType, setSpecimenType] = useState<SpecimenType | ''>('');
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['lab-tests', page, search, category, specimenType],
    queryFn: () =>
      labTestService.getLabTests({
        page,
        limit,
        search,
        category: category || undefined,
        specimenType: specimenType || undefined,
      }),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const tests = data?.tests ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Test Catalog</h1>
          <p className="text-gray-500 mt-1">Manage laboratory tests, panels, and reference ranges.</p>
        </div>
        <Link to="/lis/tests/new">
          <Button>
            <Plus size={18} className="mr-2" />
            Add Test
          </Button>
        </Link>
      </div>

      <LISNav />

      <Card className="p-4">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Search tests..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value as LabTestCategory);
              setPage(1);
            }}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{formatCategory(cat)}</option>
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
            <option value="">All Specimen Types</option>
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
          <div className="p-8 text-center">Loading tests...</div>
        ) : tests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No tests found. Add your first test to get started.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Code</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Specimen</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">TAT (min)</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {tests.map((test: LabTest) => (
                    <tr key={test.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">{test.code}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{test.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatCategory(test.category)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatSpecimenType(test.specimenType)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{test.turnaroundTime}</td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            test.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {test.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/lis/tests/${test.id}/edit`}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit Test"
                          >
                            <Pencil size={16} />
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
