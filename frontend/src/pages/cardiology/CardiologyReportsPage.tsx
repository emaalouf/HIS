import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cardiologyReportService } from '../../services/cardiology-report.service';
import { Button, Card, CardContent, Input } from '../../components/ui';
import { RefreshCcw } from 'lucide-react';
import { CardiologyNav } from './CardiologyNav';

const formatValue = (value?: number) => (value === undefined ? '--' : value.toFixed(1));

export function CardiologyReportsPage() {
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
    });

    const { data, isFetching, refetch } = useQuery({
        queryKey: ['cardiology-reports', filters.startDate, filters.endDate],
        queryFn: () => cardiologyReportService.getSummary({
            startDate: filters.startDate || undefined,
            endDate: filters.endDate || undefined,
        }),
    });

    const metrics = [
        { label: 'Total Visits', value: data?.totalVisits ?? '--' },
        { label: 'Completed Visits', value: data?.completedVisits ?? '--' },
        { label: 'Cancelled Visits', value: data?.cancelledVisits ?? '--' },
        { label: 'Total ECGs', value: data?.totalEcgs ?? '--' },
        { label: 'Total Echos', value: data?.totalEchos ?? '--' },
        { label: 'Total Stress Tests', value: data?.totalStressTests ?? '--' },
        { label: 'Total Procedures', value: data?.totalProcedures ?? '--' },
        { label: 'Completed Procedures', value: data?.completedProcedures ?? '--' },
        { label: 'Avg LVEF', value: data?.averageLvef !== undefined ? `${formatValue(data.averageLvef)}%` : '--' },
        { label: 'Avg Troponin', value: data?.averageTroponin !== undefined ? formatValue(data.averageTroponin) : '--' },
        { label: 'Active Devices', value: data?.activeDevices ?? '--' },
        { label: 'Active Medications', value: data?.activeMedications ?? '--' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Cardiology Reports</h1>
                    <p className="text-gray-500 mt-1">Monitor cardiology activity and clinical signals.</p>
                </div>
                <Button variant="outline" onClick={() => refetch()}>
                    <RefreshCcw size={16} className="mr-2" />
                    {isFetching ? 'Refreshing...' : 'Refresh'}
                </Button>
            </div>

            <CardiologyNav />

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
