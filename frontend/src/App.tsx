import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { PatientListPage } from './pages/patients/PatientListPage';
import { PatientDetailPage } from './pages/patients/PatientDetailPage';
import { PatientFormPage } from './pages/patients/PatientFormPage';
import { AppointmentListPage } from './pages/appointments/AppointmentListPage';
import { EncounterListPage } from './pages/encounters/EncounterListPage';
import { EncounterFormPage } from './pages/encounters/EncounterFormPage';
import { ClinicalOrdersPage } from './pages/encounters/ClinicalOrdersPage';
import { ClinicalOrderFormPage } from './pages/encounters/ClinicalOrderFormPage';
import { ClinicalResultsPage } from './pages/encounters/ClinicalResultsPage';
import { ClinicalResultFormPage } from './pages/encounters/ClinicalResultFormPage';
import { MedicationOrdersPage } from './pages/pharmacy/MedicationOrdersPage';
import { MedicationOrderFormPage } from './pages/pharmacy/MedicationOrderFormPage';
import { MedicationAdministrationsPage } from './pages/pharmacy/MedicationAdministrationsPage';
import { MedicationAdministrationFormPage } from './pages/pharmacy/MedicationAdministrationFormPage';
import { AdmissionsListPage } from './pages/admissions/AdmissionsListPage';
import { AdmissionFormPage } from './pages/admissions/AdmissionFormPage';
import { WardsListPage } from './pages/admissions/WardsListPage';
import { WardFormPage } from './pages/admissions/WardFormPage';
import { BedsListPage } from './pages/admissions/BedsListPage';
import { BedFormPage } from './pages/admissions/BedFormPage';
import { InvoicesPage } from './pages/billing/InvoicesPage';
import { InvoiceFormPage } from './pages/billing/InvoiceFormPage';
import { PaymentsPage } from './pages/billing/PaymentsPage';
import { PaymentFormPage } from './pages/billing/PaymentFormPage';
import { ClaimsPage } from './pages/billing/ClaimsPage';
import { ClaimFormPage } from './pages/billing/ClaimFormPage';
import { ProviderListPage } from './pages/providers/ProviderListPage';
import { ProviderFormPage } from './pages/providers/ProviderFormPage';
import { RoleListPage } from './pages/roles/RoleListPage';
import { RoleFormPage } from './pages/roles/RoleFormPage';
import { PermissionListPage } from './pages/permissions/PermissionListPage';
import { PermissionFormPage } from './pages/permissions/PermissionFormPage';
import { SpecialtyListPage } from './pages/specialties/SpecialtyListPage';
import { SpecialtyFormPage } from './pages/specialties/SpecialtyFormPage';
import { DepartmentListPage } from './pages/departments/DepartmentListPage';
import { DepartmentFormPage } from './pages/departments/DepartmentFormPage';
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
import { CardiologyListPage } from './pages/cardiology/CardiologyListPage';
import { CardiologyFormPage } from './pages/cardiology/CardiologyFormPage';
import { CardiologyEcgsPage } from './pages/cardiology/CardiologyEcgsPage';
import { CardiologyEcgFormPage } from './pages/cardiology/CardiologyEcgFormPage';
import { CardiologyEchosPage } from './pages/cardiology/CardiologyEchosPage';
import { CardiologyEchoFormPage } from './pages/cardiology/CardiologyEchoFormPage';
import { CardiologyStressTestsPage } from './pages/cardiology/CardiologyStressTestsPage';
import { CardiologyStressTestFormPage } from './pages/cardiology/CardiologyStressTestFormPage';
import { CardiologyProceduresPage } from './pages/cardiology/CardiologyProceduresPage';
import { CardiologyProcedureFormPage } from './pages/cardiology/CardiologyProcedureFormPage';
import { CardiologyDevicesPage } from './pages/cardiology/CardiologyDevicesPage';
import { CardiologyDeviceFormPage } from './pages/cardiology/CardiologyDeviceFormPage';
import { CardiologyMedicationsPage } from './pages/cardiology/CardiologyMedicationsPage';
import { CardiologyMedicationFormPage } from './pages/cardiology/CardiologyMedicationFormPage';
import { CardiologyLabsPage } from './pages/cardiology/CardiologyLabsPage';
import { CardiologyLabFormPage } from './pages/cardiology/CardiologyLabFormPage';
import { CardiologyElectrophysiologyPage } from './pages/cardiology/CardiologyElectrophysiologyPage';
import { CardiologyElectrophysiologyFormPage } from './pages/cardiology/CardiologyElectrophysiologyFormPage';
import { CardiologyHeartFailurePage } from './pages/cardiology/CardiologyHeartFailurePage';
import { CardiologyHeartFailureFormPage } from './pages/cardiology/CardiologyHeartFailureFormPage';
import { CardiologyReportsPage } from './pages/cardiology/CardiologyReportsPage';
import { NephrologyListPage } from './pages/nephrology/NephrologyListPage';
import { NephrologyFormPage } from './pages/nephrology/NephrologyFormPage';
import { NephrologyLabsPage } from './pages/nephrology/NephrologyLabsPage';
import { NephrologyLabFormPage } from './pages/nephrology/NephrologyLabFormPage';
import { NephrologyImagingPage } from './pages/nephrology/NephrologyImagingPage';
import { NephrologyImagingFormPage } from './pages/nephrology/NephrologyImagingFormPage';
import { NephrologyBiopsiesPage } from './pages/nephrology/NephrologyBiopsiesPage';
import { NephrologyBiopsyFormPage } from './pages/nephrology/NephrologyBiopsyFormPage';
import { NephrologyMedicationsPage } from './pages/nephrology/NephrologyMedicationsPage';
import { NephrologyMedicationFormPage } from './pages/nephrology/NephrologyMedicationFormPage';
import { NephrologyReportsPage } from './pages/nephrology/NephrologyReportsPage';
import { NeurologyListPage } from './pages/neurology/NeurologyListPage';
import { NeurologyFormPage } from './pages/neurology/NeurologyFormPage';
import { GastroEndoscopiesPage } from './pages/gastroenterology/GastroEndoscopiesPage';
import { GastroEndoscopyFormPage } from './pages/gastroenterology/GastroEndoscopyFormPage';
import { GastroColonoscopiesPage } from './pages/gastroenterology/GastroColonoscopiesPage';
import { GastroColonoscopyFormPage } from './pages/gastroenterology/GastroColonoscopyFormPage';
import { GastroLiverFunctionsPage } from './pages/gastroenterology/GastroLiverFunctionsPage';
import { GastroLiverFunctionFormPage } from './pages/gastroenterology/GastroLiverFunctionFormPage';
import { OperatingTheatersListPage } from './pages/operating-theaters/OperatingTheatersListPage';
import { OperatingTheaterFormPage } from './pages/operating-theaters/OperatingTheaterFormPage';
import { SurgeriesListPage } from './pages/surgeries/SurgeriesListPage';
import { SurgeryFormPage } from './pages/surgeries/SurgeryFormPage';
import './index.css';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<MainLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/appointments" element={<AppointmentListPage />} />
        <Route path="/encounters" element={<EncounterListPage />} />
        <Route path="/encounters/new" element={<EncounterFormPage />} />
        <Route path="/encounters/:id/edit" element={<EncounterFormPage />} />
        <Route path="/clinical-orders" element={<ClinicalOrdersPage />} />
        <Route path="/clinical-orders/new" element={<ClinicalOrderFormPage />} />
        <Route path="/clinical-orders/:id/edit" element={<ClinicalOrderFormPage />} />
        <Route path="/clinical-results" element={<ClinicalResultsPage />} />
        <Route path="/clinical-results/new" element={<ClinicalResultFormPage />} />
        <Route path="/clinical-results/:id/edit" element={<ClinicalResultFormPage />} />
        <Route path="/pharmacy" element={<MedicationOrdersPage />} />
        <Route path="/pharmacy/medication-orders" element={<MedicationOrdersPage />} />
        <Route path="/pharmacy/medication-orders/new" element={<MedicationOrderFormPage />} />
        <Route path="/pharmacy/medication-orders/:id/edit" element={<MedicationOrderFormPage />} />
        <Route path="/pharmacy/administrations" element={<MedicationAdministrationsPage />} />
        <Route path="/pharmacy/administrations/new" element={<MedicationAdministrationFormPage />} />
        <Route path="/pharmacy/administrations/:id/edit" element={<MedicationAdministrationFormPage />} />
        <Route path="/admissions" element={<AdmissionsListPage />} />
        <Route path="/admissions/new" element={<AdmissionFormPage />} />
        <Route path="/admissions/:id/edit" element={<AdmissionFormPage />} />
        <Route path="/admissions/wards" element={<WardsListPage />} />
        <Route path="/admissions/wards/new" element={<WardFormPage />} />
        <Route path="/admissions/wards/:id/edit" element={<WardFormPage />} />
        <Route path="/admissions/beds" element={<BedsListPage />} />
        <Route path="/admissions/beds/new" element={<BedFormPage />} />
        <Route path="/admissions/beds/:id/edit" element={<BedFormPage />} />
        <Route path="/billing" element={<InvoicesPage />} />
        <Route path="/billing/invoices" element={<InvoicesPage />} />
        <Route path="/billing/invoices/new" element={<InvoiceFormPage />} />
        <Route path="/billing/invoices/:id/edit" element={<InvoiceFormPage />} />
        <Route path="/billing/payments" element={<PaymentsPage />} />
        <Route path="/billing/payments/new" element={<PaymentFormPage />} />
        <Route path="/billing/payments/:id/edit" element={<PaymentFormPage />} />
        <Route path="/billing/claims" element={<ClaimsPage />} />
        <Route path="/billing/claims/new" element={<ClaimFormPage />} />
        <Route path="/billing/claims/:id/edit" element={<ClaimFormPage />} />
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
        <Route path="/cardiology" element={<CardiologyListPage />} />
        <Route path="/cardiology/new" element={<CardiologyFormPage />} />
        <Route path="/cardiology/:id/edit" element={<CardiologyFormPage />} />
        <Route path="/cardiology/ecgs" element={<CardiologyEcgsPage />} />
        <Route path="/cardiology/ecgs/new" element={<CardiologyEcgFormPage />} />
        <Route path="/cardiology/ecgs/:id/edit" element={<CardiologyEcgFormPage />} />
        <Route path="/cardiology/echos" element={<CardiologyEchosPage />} />
        <Route path="/cardiology/echos/new" element={<CardiologyEchoFormPage />} />
        <Route path="/cardiology/echos/:id/edit" element={<CardiologyEchoFormPage />} />
        <Route path="/cardiology/stress-tests" element={<CardiologyStressTestsPage />} />
        <Route path="/cardiology/stress-tests/new" element={<CardiologyStressTestFormPage />} />
        <Route path="/cardiology/stress-tests/:id/edit" element={<CardiologyStressTestFormPage />} />
        <Route path="/cardiology/procedures" element={<CardiologyProceduresPage />} />
        <Route path="/cardiology/procedures/new" element={<CardiologyProcedureFormPage />} />
        <Route path="/cardiology/procedures/:id/edit" element={<CardiologyProcedureFormPage />} />
        <Route path="/cardiology/devices" element={<CardiologyDevicesPage />} />
        <Route path="/cardiology/devices/new" element={<CardiologyDeviceFormPage />} />
        <Route path="/cardiology/devices/:id/edit" element={<CardiologyDeviceFormPage />} />
        <Route path="/cardiology/medications" element={<CardiologyMedicationsPage />} />
        <Route path="/cardiology/medications/new" element={<CardiologyMedicationFormPage />} />
<Route path="/cardiology/medications/:id/edit" element={<CardiologyMedicationFormPage />} />
<Route path="/cardiology/labs" element={<CardiologyLabsPage />} />
<Route path="/cardiology/labs/new" element={<CardiologyLabFormPage />} />
<Route path="/cardiology/labs/:id/edit" element={<CardiologyLabFormPage />} />
<Route path="/cardiology/electrophysiology" element={<CardiologyElectrophysiologyPage />} />
<Route path="/cardiology/electrophysiology/new" element={<CardiologyElectrophysiologyFormPage />} />
<Route path="/cardiology/electrophysiology/:id/edit" element={<CardiologyElectrophysiologyFormPage />} />
<Route path="/cardiology/heart-failure" element={<CardiologyHeartFailurePage />} />
<Route path="/cardiology/heart-failure/new" element={<CardiologyHeartFailureFormPage />} />
<Route path="/cardiology/heart-failure/:id/edit" element={<CardiologyHeartFailureFormPage />} />
<Route path="/cardiology/reports" element={<CardiologyReportsPage />} />
        <Route path="/nephrology" element={<NephrologyListPage />} />
        <Route path="/nephrology/new" element={<NephrologyFormPage />} />
        <Route path="/nephrology/:id/edit" element={<NephrologyFormPage />} />
        <Route path="/nephrology/labs" element={<NephrologyLabsPage />} />
        <Route path="/nephrology/labs/new" element={<NephrologyLabFormPage />} />
        <Route path="/nephrology/labs/:id/edit" element={<NephrologyLabFormPage />} />
        <Route path="/nephrology/imaging" element={<NephrologyImagingPage />} />
        <Route path="/nephrology/imaging/new" element={<NephrologyImagingFormPage />} />
        <Route path="/nephrology/imaging/:id/edit" element={<NephrologyImagingFormPage />} />
        <Route path="/nephrology/biopsies" element={<NephrologyBiopsiesPage />} />
        <Route path="/nephrology/biopsies/new" element={<NephrologyBiopsyFormPage />} />
        <Route path="/nephrology/biopsies/:id/edit" element={<NephrologyBiopsyFormPage />} />
        <Route path="/nephrology/medications" element={<NephrologyMedicationsPage />} />
        <Route path="/nephrology/medications/new" element={<NephrologyMedicationFormPage />} />
        <Route path="/nephrology/medications/:id/edit" element={<NephrologyMedicationFormPage />} />
        <Route path="/nephrology/reports" element={<NephrologyReportsPage />} />
        <Route path="/neurology" element={<NeurologyListPage />} />
        <Route path="/neurology/new" element={<NeurologyFormPage />} />
        <Route path="/neurology/:id/edit" element={<NeurologyFormPage />} />
        <Route path="/gastroenterology" element={<GastroEndoscopiesPage />} />
        <Route path="/gastroenterology/endoscopies" element={<GastroEndoscopiesPage />} />
        <Route path="/gastroenterology/endoscopies/new" element={<GastroEndoscopyFormPage />} />
        <Route path="/gastroenterology/endoscopies/:id/edit" element={<GastroEndoscopyFormPage />} />
        <Route path="/gastroenterology/colonoscopies" element={<GastroColonoscopiesPage />} />
        <Route path="/gastroenterology/colonoscopies/new" element={<GastroColonoscopyFormPage />} />
        <Route path="/gastroenterology/colonoscopies/:id/edit" element={<GastroColonoscopyFormPage />} />
        <Route path="/gastroenterology/liver-function" element={<GastroLiverFunctionsPage />} />
        <Route path="/gastroenterology/liver-function/new" element={<GastroLiverFunctionFormPage />} />
        <Route path="/gastroenterology/liver-function/:id/edit" element={<GastroLiverFunctionFormPage />} />
        <Route path="/operating-theaters" element={<OperatingTheatersListPage />} />
        <Route path="/operating-theaters/new" element={<OperatingTheaterFormPage />} />
        <Route path="/operating-theaters/:id/edit" element={<OperatingTheaterFormPage />} />
        <Route path="/surgeries" element={<SurgeriesListPage />} />
        <Route path="/surgeries/new" element={<SurgeryFormPage />} />
        <Route path="/surgeries/:id/edit" element={<SurgeryFormPage />} />
        <Route path="/providers" element={<ProviderListPage />} />
        <Route path="/providers/new" element={<ProviderFormPage />} />
        <Route path="/providers/:id/edit" element={<ProviderFormPage />} />
        <Route path="/specialties" element={<SpecialtyListPage />} />
        <Route path="/specialties/new" element={<SpecialtyFormPage />} />
        <Route path="/specialties/:id/edit" element={<SpecialtyFormPage />} />
        <Route path="/departments" element={<DepartmentListPage />} />
        <Route path="/departments/new" element={<DepartmentFormPage />} />
        <Route path="/departments/:id/edit" element={<DepartmentFormPage />} />
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
