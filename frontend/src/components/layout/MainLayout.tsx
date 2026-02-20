import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../stores/auth';
import { Sidebar } from './Sidebar';
import { AIChatWidget } from '../ai-chat';
import { AIChatProvider } from '../../stores/ai-chat';

export function MainLayout() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <AIChatProvider>
            <div className="min-h-screen bg-gray-50">
                <Sidebar />
                <main className="lg:pl-64 min-h-screen transition-all duration-300">
                    <div className="p-4 sm:p-6 lg:p-8">
                        <Outlet />
                    </div>
                </main>
                <AIChatWidget />
            </div>
        </AIChatProvider>
    );
}
