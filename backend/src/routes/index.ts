import { Router } from 'express';
import authRoutes from './auth.routes';
import patientRoutes from './patient.routes';
import appointmentRoutes from './appointment.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/appointments', appointmentRoutes);

export default router;
