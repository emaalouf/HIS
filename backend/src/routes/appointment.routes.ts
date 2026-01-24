import { Router } from 'express';
import {
    createAppointment,
    getAppointmentById,
    getAppointments,
    getAppointmentMeta,
    updateAppointment,
    updateAppointmentStatus,
} from '../controllers/appointment.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
    createAppointmentSchema,
    updateAppointmentSchema,
    updateAppointmentStatusSchema,
} from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/meta', getAppointmentMeta);
router.get('/', getAppointments);
router.post('/', authorize('ADMIN', 'RECEPTIONIST'), validate(createAppointmentSchema), createAppointment);
router.get('/:id', getAppointmentById);
router.put('/:id', authorize('ADMIN', 'RECEPTIONIST'), validate(updateAppointmentSchema), updateAppointment);
router.patch(
    '/:id/status',
    authorize('ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE'),
    validate(updateAppointmentStatusSchema),
    updateAppointmentStatus
);

export default router;
