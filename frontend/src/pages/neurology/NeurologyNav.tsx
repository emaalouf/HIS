import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';

const navItems = [
    { name: 'Visits', href: '/neurology' },
    { name: 'EEG', href: '/neurology/eegs' },
    { name: 'EMG', href: '/neurology/emgs' },
    { name: 'Stroke', href: '/neurology/strokes' },
    { name: 'Imaging', href: '/neurology/imaging' },
    { name: 'Seizure', href: '/neurology/seizures' },
    { name: 'Cognitive', href: '/neurology/cognitive' },
];

export function NeurologyNav() {
    return (
        <div className="overflow-x-auto">
            <div className="inline-flex gap-2 rounded-xl border border-gray-100 bg-white p-2 shadow-sm min-w-full">
                {navItems.map((item) => (
                    <NavLink
                        key={item.href}
                        to={item.href}
                        end={item.href === '/neurology'}
                        className={({ isActive }) =>
                            cn(
                                'px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                                isActive
                                    ? 'bg-purple-600 text-white'
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
