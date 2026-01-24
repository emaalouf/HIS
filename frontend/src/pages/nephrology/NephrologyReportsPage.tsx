import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { nephrologyReportService } from '../../services/nephrology-report.service';
import { Button, Card, CardContent, Input } from '../../components/ui';
import { RefreshCcw } from 'lucide-react';
import { NephrologyNav } from './NephrologyNav';

const formatValue = (value?: number) => (value === undefined ? '--' : value.toFixed(1));

export function NephrologyReportsPage() {
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
    });

    const { data, isFetching, refetch } = useQuery({
        queryKey: ['nephrology-reports', filters.startDate, filters.endDate],
        queryFn: () => nephrologyReportService.getSummary({
            startDate: filters.startDate || undefined,
            endDate: filters.endDate || undefined,
        }),
    });

    const metrics = [
        { label: 'Total Visits', value: data?.totalVisits ?? '--' },
        { label: 'Completed Visits', value: data?.completedVisits ?? '--' },
        { label: 'Cancelled Visits', value: data?.cancelledVisits ?? '--' },
        { label: 'Total Imaging', value: data?.totalImaging ?? '--' },
        { label: 'Completed Imaging', value: data?.completedImaging ?? '--' },
        { label: 'Total Biopsies', value: data?.totalBiopsies ?? '--' },
        { label: 'Completed Biopsies', value: data?.completedBiopsies ?? '--' },
        { label: 'Avg eGFR', value: data?.averageEgfr !== undefined ? formatValue(data.averageEgfr) : '--' },
        { label: 'Avg Creatinine', value: data?.averageCreatinine !== undefined ? formatValue(data.averageCreatinine) : '--' },
        { label: 'Avg UACR', value: data?.averageUacr !== undefined ? formatValue(data.averageUacr) : '--' },
        { label: 'Active Medications', value: data?.activeMedications ?? '--' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Nephrology Reports</h1>
                    <p className="text-gray-500 mt-1">Monitor kidney clinic activity and outcomes.</p>
                </div>
                <Button variant="outline" onClick={() => refetch()}>
                    <RefreshCcw size={16} className="mr-2" />
                    {isFetching ? 'Refreshing...' : 'Refresh'}
                </Button>
            </div>

            <NephrologyNav />

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
