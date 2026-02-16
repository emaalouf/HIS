import { Router } from 'express';
import authRoutes from './auth.routes';
import patientRoutes from './patient.routes';
import departmentRoutes from './department.routes';
import specialtyRoutes from './specialty.routes';
import providerRoutes from './provider.routes';
import appointmentRoutes from './appointment.routes';
import dialysisSessionRoutes from './dialysis-session.routes';
import dialysisPrescriptionRoutes from './dialysis-prescription.routes';
import dialysisFlowsheetRoutes from './dialysis-flowsheet.routes';
import dialysisStationRoutes from './dialysis-station.routes';
import dialysisScheduleRoutes from './dialysis-schedule.routes';
import dialysisLabRoutes from './dialysis-lab.routes';
import dialysisMedicationRoutes from './dialysis-medication.routes';
import dialysisReportRoutes from './dialysis-report.routes';
import cardiologyVisitRoutes from './cardiology-visit.routes';
import cardiologyEcgRoutes from './cardiology-ecg.routes';
import cardiologyEchoRoutes from './cardiology-echo.routes';
import cardiologyStressTestRoutes from './cardiology-stress-test.routes';
import cardiologyProcedureRoutes from './cardiology-procedure.routes';
import cardiologyDeviceRoutes from './cardiology-device.routes';
import cardiologyMedicationRoutes from './cardiology-medication.routes';
import cardiologyLabRoutes from './cardiology-lab.routes';
import cardiologyElectrophysiologyRoutes from './cardiology-electrophysiology.routes';
import cardiologyHeartFailureRoutes from './cardiology-heart-failure.routes';
import cardiologyReportRoutes from './cardiology-report.routes';
import nephrologyVisitRoutes from './nephrology-visit.routes';
import nephrologyLabRoutes from './nephrology-lab.routes';
import nephrologyImagingRoutes from './nephrology-imaging.routes';
import nephrologyBiopsyRoutes from './nephrology-biopsy.routes';
import nephrologyMedicationRoutes from './nephrology-medication.routes';
import nephrologyReportRoutes from './nephrology-report.routes';
import neurologyVisitRoutes from './neurology-visit.routes';
import gastroEndoscopyRoutes from './gastro-endoscopy.routes';
import gastroColonoscopyRoutes from './gastro-colonoscopy.routes';
import gastroLiverFunctionRoutes from './gastro-liver-function.routes';
import encounterRoutes from './encounter.routes';
import clinicalOrderRoutes from './clinical-order.routes';
import clinicalResultRoutes from './clinical-result.routes';
import medicationOrderRoutes from './medication-order.routes';
import medicationAdministrationRoutes from './medication-administration.routes';
import wardRoutes from './ward.routes';
import bedRoutes from './bed.routes';
import admissionRoutes from './admission.routes';
import surgeryRoutes from './surgery.routes';
import operatingTheaterRoutes from './operating-theater.routes';
import invoiceRoutes from './invoice.routes';
import paymentRoutes from './payment.routes';
import claimRoutes from './claim.routes';
import labTestRoutes from './labTests.routes';
import testPanelRoutes from './testPanels.routes';
import specimenRoutes from './specimens.routes';
import labWorkOrderRoutes from './labWorkOrders.routes';
import labResultRoutes from './labResults.routes';
import referenceRangeRoutes from './referenceRanges.routes';
import qcControlRoutes from './qcControls.routes';
import imagingStudyRoutes from './imagingStudies.routes';
import radiologistReportRoutes from './radiologistReports.routes';
import edVisitRoutes from './edVisits.routes';
import icuAdmissionRoutes from './icuAdmissions.routes';
import bloodProductRoutes from './bloodProducts.routes';
import inventoryItemRoutes from './inventoryItems.routes';
import inventoryLocationRoutes from './inventoryLocations.routes';
import inventoryTransactionRoutes from './inventoryTransactions.routes';
import supplierRoutes from './suppliers.routes';
import purchaseOrderRoutes from './purchaseOrders.routes';
import requisitionRoutes from './requisitions.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/departments', departmentRoutes);
router.use('/specialties', specialtyRoutes);
router.use('/providers', providerRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/dialysis-sessions', dialysisSessionRoutes);
router.use('/dialysis-prescriptions', dialysisPrescriptionRoutes);
router.use('/dialysis-flowsheets', dialysisFlowsheetRoutes);
router.use('/dialysis-stations', dialysisStationRoutes);
router.use('/dialysis-schedules', dialysisScheduleRoutes);
router.use('/dialysis-labs', dialysisLabRoutes);
router.use('/dialysis-medications', dialysisMedicationRoutes);
router.use('/dialysis-reports', dialysisReportRoutes);
router.use('/cardiology-visits', cardiologyVisitRoutes);
router.use('/cardiology-ecgs', cardiologyEcgRoutes);
router.use('/cardiology-echos', cardiologyEchoRoutes);
router.use('/cardiology-stress-tests', cardiologyStressTestRoutes);
router.use('/cardiology-procedures', cardiologyProcedureRoutes);
router.use('/cardiology-devices', cardiologyDeviceRoutes);
router.use('/cardiology-medications', cardiologyMedicationRoutes);
router.use('/cardiology-labs', cardiologyLabRoutes);
router.use('/cardiology-electrophysiology', cardiologyElectrophysiologyRoutes);
router.use('/cardiology-heart-failure', cardiologyHeartFailureRoutes);
router.use('/cardiology-reports', cardiologyReportRoutes);
router.use('/nephrology-visits', nephrologyVisitRoutes);
router.use('/nephrology-labs', nephrologyLabRoutes);
router.use('/nephrology-imaging', nephrologyImagingRoutes);
router.use('/nephrology-biopsies', nephrologyBiopsyRoutes);
router.use('/nephrology-medications', nephrologyMedicationRoutes);
router.use('/nephrology-reports', nephrologyReportRoutes);
router.use('/neurology-visits', neurologyVisitRoutes);
router.use('/gastro-endoscopies', gastroEndoscopyRoutes);
router.use('/gastro-colonoscopies', gastroColonoscopyRoutes);
router.use('/gastro-liver-functions', gastroLiverFunctionRoutes);
router.use('/encounters', encounterRoutes);
router.use('/clinical-orders', clinicalOrderRoutes);
router.use('/clinical-results', clinicalResultRoutes);
router.use('/medication-orders', medicationOrderRoutes);
router.use('/medication-administrations', medicationAdministrationRoutes);
router.use('/wards', wardRoutes);
router.use('/beds', bedRoutes);
router.use('/admissions', admissionRoutes);
router.use('/surgeries', surgeryRoutes);
router.use('/operating-theaters', operatingTheaterRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/payments', paymentRoutes);
router.use('/claims', claimRoutes);

// LIS - Laboratory Information System Routes
router.use('/lab-tests', labTestRoutes);
router.use('/test-panels', testPanelRoutes);
router.use('/specimens', specimenRoutes);
router.use('/lab-work-orders', labWorkOrderRoutes);
router.use('/lab-results', labResultRoutes);
router.use('/reference-ranges', referenceRangeRoutes);
router.use('/qc-controls', qcControlRoutes);

// Radiology/PACS Routes
router.use('/imaging-studies', imagingStudyRoutes);
router.use('/radiologist-reports', radiologistReportRoutes);

// Emergency Department Routes
router.use('/ed-visits', edVisitRoutes);

// ICU / Critical Care Routes
router.use('/icu-admissions', icuAdmissionRoutes);

// Blood Bank Routes
router.use('/blood-products', bloodProductRoutes);

// Inventory / Supply Chain Routes
router.use('/inventory-items', inventoryItemRoutes);
router.use('/inventory-locations', inventoryLocationRoutes);
router.use('/inventory-transactions', inventoryTransactionRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/purchase-orders', purchaseOrderRoutes);
router.use('/requisitions', requisitionRoutes);

export default router;
