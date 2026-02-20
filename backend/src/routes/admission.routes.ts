import { Router } from 'express';
import {
    createAdmission,
    deleteAdmission,
    getAdmissionById,
    getAdmissions,
    updateAdmission,
} from '../controllers/admission.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createAdmissionSchema, updateAdmissionSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getAdmissions);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createAdmissionSchema),
    createAdmission
);
router.get('/:id', getAdmissionById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateAdmissionSchema),
    updateAdmission
);
router.delete('/:id', authorize('ADMIN'), deleteAdmission);

export default router;
