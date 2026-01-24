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
import { DialysisPrescriptionsPage } from './pages/dialysis/DialysisPrescriptionsPage';
import { DialysisPrescriptionFormPage } from './pages/dialysis/DialysisPrescriptionFormPage';
import { DialysisFlowsheetPage } from './pages/dialysis/DialysisFlowsheetPage';
import { DialysisFlowsheetFormPage } from './pages/dialysis/DialysisFlowsheetFormPage';
import { DialysisStationsPage } from './pages/dialysis/DialysisStationsPage';
import { DialysisStationFormPage } from './pages/dialysis/DialysisStationFormPage';
import { DialysisSchedulesPage } from './pages/dialysis/DialysisSchedulesPage';
import { DialysisScheduleFormPage } from './pages/dialysis/DialysisScheduleFormPage';
import { DialysisLabsPage } from './pages/dialysis/DialysisLabsPage';
import { DialysisLabFormPage } from './pages/dialysis/DialysisLabFormPage';
import { DialysisMedicationsPage } from './pages/dialysis/DialysisMedicationsPage';
import { DialysisMedicationFormPage } from './pages/dialysis/DialysisMedicationFormPage';
import { DialysisReportsPage } from './pages/dialysis/DialysisReportsPage';
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
        <Route path="/dialysis/prescriptions" element={<DialysisPrescriptionsPage />} />
        <Route path="/dialysis/prescriptions/new" element={<DialysisPrescriptionFormPage />} />
        <Route path="/dialysis/prescriptions/:id/edit" element={<DialysisPrescriptionFormPage />} />
        <Route path="/dialysis/flowsheets" element={<DialysisFlowsheetPage />} />
        <Route path="/dialysis/flowsheets/new" element={<DialysisFlowsheetFormPage />} />
        <Route path="/dialysis/flowsheets/:id/edit" element={<DialysisFlowsheetFormPage />} />
        <Route path="/dialysis/stations" element={<DialysisStationsPage />} />
        <Route path="/dialysis/stations/new" element={<DialysisStationFormPage />} />
        <Route path="/dialysis/stations/:id/edit" element={<DialysisStationFormPage />} />
        <Route path="/dialysis/schedules" element={<DialysisSchedulesPage />} />
        <Route path="/dialysis/schedules/new" element={<DialysisScheduleFormPage />} />
        <Route path="/dialysis/schedules/:id/edit" element={<DialysisScheduleFormPage />} />
        <Route path="/dialysis/labs" element={<DialysisLabsPage />} />
        <Route path="/dialysis/labs/new" element={<DialysisLabFormPage />} />
        <Route path="/dialysis/labs/:id/edit" element={<DialysisLabFormPage />} />
        <Route path="/dialysis/medications" element={<DialysisMedicationsPage />} />
        <Route path="/dialysis/medications/new" element={<DialysisMedicationFormPage />} />
        <Route path="/dialysis/medications/:id/edit" element={<DialysisMedicationFormPage />} />
        <Route path="/dialysis/reports" element={<DialysisReportsPage />} />
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
