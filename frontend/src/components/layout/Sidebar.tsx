import { NavLink } from 'react-router-dom';
import { useAuth } from '../../stores/auth';
import {
    LayoutDashboard,
    Users,
    LogOut,
    Menu,
    X,
    Activity,
    CalendarClock,
    Stethoscope,
    Shield,
    Key,
    ClipboardList,
    Droplet,
    HeartPulse,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Appointments', href: '/appointments', icon: CalendarClock },
    { name: 'Dialysis', href: '/dialysis', icon: Droplet },
    { name: 'Cardiology', href: '/cardiology', icon: HeartPulse },
    { name: 'Providers', href: '/providers', icon: Stethoscope },
    { name: 'Specialties', href: '/specialties', icon: ClipboardList },
    { name: 'Roles', href: '/roles', icon: Shield },
    { name: 'Permissions', href: '/permissions', icon: Key },
    { name: 'Patients', href: '/patients', icon: Users },
];

export function Sidebar() {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile menu button */}
            <button
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed left-0 top-0 z-40 h-screen w-64 bg-gradient-to-b from-slate-900 to-slate-800 transition-transform duration-300',
                    'lg:translate-x-0',
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-700">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Activity className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">HMS</h1>
                            <p className="text-xs text-slate-400">Hospital Management</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1">
                        {navigation.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.href}
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) =>
                                    cn(
                                        'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                                        isActive
                                            ? 'bg-blue-600 text-white'
                                            : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                                    )
                                }
                            >
                                <item.icon size={20} />
                                {item.name}
                            </NavLink>
                        ))}
                    </nav>

                    {/* User section */}
                    <div className="p-4 border-t border-slate-700">
                        <div className="flex items-center gap-3 px-2 py-2">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p className="text-xs text-slate-400 truncate">{user?.role}</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="mt-2 w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors"
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
