import { Link, useLocation } from 'react-router-dom';
import { FlaskConical, TestTube, ClipboardList, FileText, Activity } from 'lucide-react';

export function LISNav() {
    const location = useLocation();
    
    const navItems = [
        { path: '/lis/tests', label: 'Test Catalog', icon: FlaskConical },
        { path: '/lis/panels', label: 'Test Panels', icon: TestTube },
        { path: '/lis/specimens', label: 'Specimens', icon: ClipboardList },
        { path: '/lis/work-orders', label: 'Work Orders', icon: FileText },
        { path: '/lis/results', label: 'Results', icon: FileText },
        { path: '/lis/qc', label: 'QC & QA', icon: Activity },
    ];

    return (
        <nav className="bg-white border rounded-lg overflow-hidden">
            <div className="flex flex-wrap">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname.startsWith(item.path);
                    
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                                isActive
                                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            <Icon size={16} />
                            {item.label}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
