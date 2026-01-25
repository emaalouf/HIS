import { Link } from 'react-router-dom';
import { SurgeriesListPage } from './SurgeriesListPage';
import { SurgeryFormPage } from './SurgeryFormPage';

export function SurgeriesNav() {
    return (
        <div className="border-b border-gray-200 mb-6">
            <nav className="flex gap-4">
                <Link
                    to="/surgeries"
                    className={({ isActive }) =>
                        `px-4 py-2 text-sm font-medium transition-colors ${
                            isActive
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                        }`
                    }
                >
                    All Surgeries
                </Link>
            </nav>
        </div>
    );
}

export { SurgeriesListPage, SurgeryFormPage };