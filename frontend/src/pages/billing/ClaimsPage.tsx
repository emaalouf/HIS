import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { claimService } from '../../services/claim.service';
import { Button, Card, Input } from '../../components/ui';
import { formatDate } from '../../lib/utils';
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Claim, ClaimStatus } from '../../types';
import { BillingNav } from './BillingNav';

const statusStyles: Record<ClaimStatus, string> = {
    DRAFT: 'bg-slate-100 text-slate-700',
    SUBMITTED: 'bg-amber-100 text-amber-700',
    ACCEPTED: 'bg-emerald-100 text-emerald-700',
    DENIED: 'bg-rose-100 text-rose-700',
    PAID: 'bg-sky-100 text-sky-700',
};

const statusOptions: ClaimStatus[] = [
    'DRAFT',
    'SUBMITTED',
    'ACCEPTED',
    'DENIED',
    'PAID',
];

export function ClaimsPage() {
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState<ClaimStatus | ''>('');
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const limit = 10;
    const patientIdParam = searchParams.get('patientId') || '';

    const { data, isLoading } = useQuery({
        queryKey: ['claims', page, status, search, patientIdParam],
        queryFn: () =>
            claimService.getClaims({
                page,
                limit,
                status: status || undefined,
                payerName: search || undefined,
                patientId: patientIdParam || undefined,
            }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => claimService.deleteClaim(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['claims'] });
        },
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    const handleDelete = (claim: Claim) => {
        if (deleteMutation.isPending) return;
        if (window.confirm('Delete this claim? This cannot be undone.')) {
            deleteMutation.mutate(claim.id);
        }
    };

    const claims = data?.claims ?? [];
    const pagination = data?.pagination;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Claims</h1>
                    <p className="text-gray-500 mt-1">Track payer submissions and responses.</p>
                </div>
                <Link to="/billing/claims/new">
                    <Button>
                        <Plus size={18} className="mr-2" />
                        New Claim
                    </Button>
                </Link>
            </div>

            <BillingNav />

            <Card className="p-4">
                <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            placeholder="Search by payer name..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="w-full lg:w-48">
                        <select
                            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value as ClaimStatus | '');
                                setPage(1);
                            }}
                        >
                            <option value="">All statuses</option>
                            {statusOptions.map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                    <Button type="submit">Search</Button>
                </form>
                {patientIdParam && (
                    <p className="mt-3 text-sm text-amber-600">
                        Filtered by patient ID: {patientIdParam}
                    </p>
                )}
            </Card>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Patient</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Payer</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Invoice</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Submitted</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Loading claims...
                                    </td>
                                </tr>
                            ) : claims.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No claims found
                                    </td>
                                </tr>
                            ) : (
                                claims.map((claim) => (
                                    <tr key={claim.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">
                                                {claim.patient
                                                    ? `${claim.patient.firstName} ${claim.patient.lastName}`
                                                    : claim.patientId}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {claim.patient?.mrn || claim.patientId}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{claim.payerName}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {claim.invoice?.invoiceNumber || claim.invoiceId}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {claim.submittedAt ? formatDate(claim.submittedAt) : '--'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[claim.status]}`}>
                                                {claim.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link to={`/billing/claims/${claim.id}/edit`}>
                                                    <Button variant="outline" size="sm">
                                                        <Pencil size={16} />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(claim)}
                                                    disabled={deleteMutation.isPending}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {pagination && pagination.totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} claims
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                <ChevronLeft size={16} />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                                disabled={page === pagination.totalPages}
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
