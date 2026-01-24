import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';

const navItems = [
    { name: 'Visits', href: '/cardiology' },
    { name: 'ECGs', href: '/cardiology/ecgs' },
    { name: 'Echos', href: '/cardiology/echos' },
    { name: 'Stress Tests', href: '/cardiology/stress-tests' },
    { name: 'Procedures', href: '/cardiology/procedures' },
    { name: 'Devices', href: '/cardiology/devices' },
    { name: 'Medications', href: '/cardiology/medications' },
    { name: 'Labs', href: '/cardiology/labs' },
    { name: 'Reports', href: '/cardiology/reports' },
];

export function CardiologyNav() {
    return (
        <div className="overflow-x-auto">
            <div className="inline-flex gap-2 rounded-xl border border-gray-100 bg-white p-2 shadow-sm min-w-full">
                {navItems.map((item) => (
                    <NavLink
                        key={item.href}
                        to={item.href}
                        end={item.href === '/cardiology'}
                        className={({ isActive }) =>
                            cn(
                                'px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                                isActive
                                    ? 'bg-rose-600 text-white'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            )
                        }
                    >
                        {item.name}
                    </NavLink>
                ))}
            </div>
        </div>
    );
}
