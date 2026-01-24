import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../stores/auth';
import { patientService } from '../../services/patient.service';
import { Card, CardContent } from '../../components/ui';
import { Users, UserPlus, Activity, ArrowRight } from 'lucide-react';

export function DashboardPage() {
    const { user } = useAuth();

    const { data: stats, isLoading } = useQuery({
        queryKey: ['patientStats'],
        queryFn: () => patientService.getStats(),
    });

    const { data: recentPatients } = useQuery({
        queryKey: ['recentPatients'],
        queryFn: () => patientService.getPatients({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
    });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back, {user?.firstName}!
                </h1>
                <p className="text-gray-500 mt-1">
                    Here's what's happening with your patients today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Total Patients</p>
                                <p className="text-4xl font-bold text-white mt-2">
                                    {isLoading ? '...' : stats?.total || 0}
                                </p>
                            </div>
                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                                <Users className="text-white" size={28} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 border-0">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-emerald-100 text-sm font-medium">Active Patients</p>
                                <p className="text-4xl font-bold text-white mt-2">
                                    {isLoading ? '...' : stats?.active || 0}
                                </p>
                            </div>
                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                                <Activity className="text-white" size={28} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-violet-500 to-violet-600 border-0">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-violet-100 text-sm font-medium">Today's Registrations</p>
                                <p className="text-4xl font-bold text-white mt-2">
                                    {isLoading ? '...' : stats?.todayRegistrations || 0}
                                </p>
                            </div>
                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                                <UserPlus className="text-white" size={28} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Patients */}
            <Card>
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Patients</h2>
                    <Link
                        to="/patients"
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                        View all <ArrowRight size={16} />
                    </Link>
                </div>
                <div className="divide-y divide-gray-100">
                    {recentPatients?.patients.map((patient) => (
                        <Link
                            key={patient.id}
                            to={`/patients/${patient.id}`}
                            className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                        >
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                                {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                    {patient.firstName} {patient.lastName}
                                </p>
                                <p className="text-sm text-gray-500">MRN: {patient.mrn}</p>
                            </div>
                            <div className="text-sm text-gray-500">
                                {patient.phone}
                            </div>
                        </Link>
                    ))}
                    {(!recentPatients?.patients || recentPatients.patients.length === 0) && (
                        <div className="px-6 py-12 text-center text-gray-500">
                            No patients registered yet
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
