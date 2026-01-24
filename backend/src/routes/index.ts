import { Router } from 'express';
import authRoutes from './auth.routes';
import patientRoutes from './patient.routes';
import appointmentRoutes from './appointment.routes';
import dialysisSessionRoutes from './dialysis-session.routes';
import dialysisPrescriptionRoutes from './dialysis-prescription.routes';
import dialysisFlowsheetRoutes from './dialysis-flowsheet.routes';
import dialysisStationRoutes from './dialysis-station.routes';
import dialysisScheduleRoutes from './dialysis-schedule.routes';
import dialysisLabRoutes from './dialysis-lab.routes';
import dialysisMedicationRoutes from './dialysis-medication.routes';
import dialysisReportRoutes from './dialysis-report.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/dialysis-sessions', dialysisSessionRoutes);
router.use('/dialysis-prescriptions', dialysisPrescriptionRoutes);
router.use('/dialysis-flowsheets', dialysisFlowsheetRoutes);
router.use('/dialysis-stations', dialysisStationRoutes);
router.use('/dialysis-schedules', dialysisScheduleRoutes);
router.use('/dialysis-labs', dialysisLabRoutes);
router.use('/dialysis-medications', dialysisMedicationRoutes);
router.use('/dialysis-reports', dialysisReportRoutes);

export default router;
