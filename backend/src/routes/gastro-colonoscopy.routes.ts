import { Router } from 'express';
import {
    createGastroColonoscopy,
    deleteGastroColonoscopy,
    getGastroColonoscopyById,
    getGastroColonoscopies,
    updateGastroColonoscopy,
} from '../controllers/gastro-colonoscopy.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createGastroColonoscopySchema, updateGastroColonoscopySchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getGastroColonoscopies);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createGastroColonoscopySchema),
    createGastroColonoscopy
);
router.get('/:id', getGastroColonoscopyById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateGastroColonoscopySchema),
    updateGastroColonoscopy
);
router.delete('/:id', authorize('ADMIN'), deleteGastroColonoscopy);

export default router;
