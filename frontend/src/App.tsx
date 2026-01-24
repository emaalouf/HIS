import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { PatientListPage } from './pages/patients/PatientListPage';
import { PatientDetailPage } from './pages/patients/PatientDetailPage';
import { PatientFormPage } from './pages/patients/PatientFormPage';
import { AppointmentListPage } from './pages/appointments/AppointmentListPage';
import { ProviderListPage } from './pages/providers/ProviderListPage';
import { ProviderFormPage } from './pages/providers/ProviderFormPage';
import { RoleListPage } from './pages/roles/RoleListPage';
import { RoleFormPage } from './pages/roles/RoleFormPage';
import { PermissionListPage } from './pages/permissions/PermissionListPage';
import { PermissionFormPage } from './pages/permissions/PermissionFormPage';
import { SpecialtyListPage } from './pages/specialties/SpecialtyListPage';
import { SpecialtyFormPage } from './pages/specialties/SpecialtyFormPage';
import { DialysisListPage } from './pages/dialysis/DialysisListPage';
import { DialysisFormPage } from './pages/dialysis/DialysisFormPage';
import './index.css';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<MainLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/appointments" element={<AppointmentListPage />} />
        <Route path="/dialysis" element={<DialysisListPage />} />
        <Route path="/dialysis/new" element={<DialysisFormPage />} />
        <Route path="/dialysis/:id/edit" element={<DialysisFormPage />} />
        <Route path="/providers" element={<ProviderListPage />} />
        <Route path="/providers/new" element={<ProviderFormPage />} />
        <Route path="/providers/:id/edit" element={<ProviderFormPage />} />
        <Route path="/specialties" element={<SpecialtyListPage />} />
        <Route path="/specialties/new" element={<SpecialtyFormPage />} />
        <Route path="/specialties/:id/edit" element={<SpecialtyFormPage />} />
        <Route path="/roles" element={<RoleListPage />} />
        <Route path="/roles/new" element={<RoleFormPage />} />
        <Route path="/roles/:id/edit" element={<RoleFormPage />} />
        <Route path="/permissions" element={<PermissionListPage />} />
        <Route path="/permissions/new" element={<PermissionFormPage />} />
        <Route path="/permissions/:id/edit" element={<PermissionFormPage />} />
        <Route path="/patients" element={<PatientListPage />} />
        <Route path="/patients/new" element={<PatientFormPage />} />
        <Route path="/patients/:id" element={<PatientDetailPage />} />
      </Route>
    </Routes>
  );
}

export default App;
