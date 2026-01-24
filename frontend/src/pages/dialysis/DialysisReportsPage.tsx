import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dialysisReportService } from '../../services/dialysis-report.service';
import { Button, Card, CardContent, Input } from '../../components/ui';
import { RefreshCcw } from 'lucide-react';
import { DialysisNav } from './DialysisNav';

const formatPercent = (value?: number) => (value === undefined ? '--' : `${value.toFixed(1)}%`);

export function DialysisReportsPage() {
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
    });

    const { data, isFetching, refetch } = useQuery({
        queryKey: ['dialysis-reports', filters.startDate, filters.endDate],
        queryFn: () => dialysisReportService.getSummary({
            startDate: filters.startDate || undefined,
            endDate: filters.endDate || undefined,
        }),
    });

    const metrics = [
        { label: 'Total Sessions', value: data?.totalSessions ?? '--' },
        { label: 'Completed Sessions', value: data?.completedSessions ?? '--' },
        { label: 'Cancelled Sessions', value: data?.cancelledSessions ?? '--' },
        { label: 'Avg Duration (min)', value: data?.averageDurationMinutes ?? '--' },
        { label: 'Avg Kt/V', value: data?.averageKtv ?? '--' },
        { label: 'Avg URR', value: data?.averageUrr ?? '--' },
        { label: 'Active Patients', value: data?.activePatients ?? '--' },
        { label: 'Chair Utilization', value: formatPercent(data?.chairUtilizationPercent) },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dialysis Reports</h1>
                    <p className="text-gray-500 mt-1">Monitor operational and clinical performance.</p>
                </div>
                <Button variant="outline" onClick={() => refetch()}>
                    <RefreshCcw size={16} className="mr-2" />
                    {isFetching ? 'Refreshing...' : 'Refresh'}
                </Button>
            </div>

            <DialysisNav />

            <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                        label="Start Date"
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                    />
                    <Input
                        label="End Date"
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                    />
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {metrics.map((metric) => (
                    <Card key={metric.label}>
                        <CardContent className="p-6">
                            <p className="text-sm text-gray-500">{metric.label}</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-2">{metric.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
