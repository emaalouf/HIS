import { Router } from 'express';
import {
    createCardiologyDevice,
    deleteCardiologyDevice,
    getCardiologyDeviceById,
    getCardiologyDevices,
    updateCardiologyDevice,
} from '../controllers/cardiology-device.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createCardiologyDeviceSchema, updateCardiologyDeviceSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getCardiologyDevices);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createCardiologyDeviceSchema),
    createCardiologyDevice
);
router.get('/:id', getCardiologyDeviceById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateCardiologyDeviceSchema),
    updateCardiologyDevice
);
router.delete('/:id', authorize('ADMIN'), deleteCardiologyDevice);

export default router;
