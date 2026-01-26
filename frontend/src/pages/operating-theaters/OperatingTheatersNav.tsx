import { NavLink } from 'react-router-dom';
import { OperatingTheatersListPage } from './OperatingTheatersListPage';
import { OperatingTheaterFormPage } from './OperatingTheaterFormPage';

export function OperatingTheatersNav() {
    return (
        <div className="border-b border-gray-200 mb-6">
            <nav className="flex gap-4">
                <NavLink
                    to="/operating-theaters"
                    className={({ isActive }) =>
                        `px-4 py-2 text-sm font-medium transition-colors ${
                            isActive
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                        }`
                    }
                >
                    All Theaters
                </NavLink>
            </nav>
        </div>
    );
}

export { OperatingTheatersListPage, OperatingTheaterFormPage };