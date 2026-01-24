import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';

const navItems = [
    { name: 'Visits', href: '/nephrology' },
    { name: 'Labs', href: '/nephrology/labs' },
    { name: 'Imaging', href: '/nephrology/imaging' },
    { name: 'Biopsies', href: '/nephrology/biopsies' },
    { name: 'Medications', href: '/nephrology/medications' },
    { name: 'Reports', href: '/nephrology/reports' },
];

export function NephrologyNav() {
    return (
        <div className="overflow-x-auto">
            <div className="inline-flex gap-2 rounded-xl border border-gray-100 bg-white p-2 shadow-sm min-w-full">
                {navItems.map((item) => (
                    <NavLink
                        key={item.href}
                        to={item.href}
                        end={item.href === '/nephrology'}
                        className={({ isActive }) =>
                            cn(
                                'px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                                isActive
                                    ? 'bg-emerald-600 text-white'
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
