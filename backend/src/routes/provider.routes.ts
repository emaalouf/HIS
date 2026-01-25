import { Router } from 'express';
import {
    createProvider,
    deleteProvider,
    getProviderById,
    getProviders,
    updateProvider,
} from '../controllers/provider.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createProviderSchema, updateProviderSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getProviders);
router.post('/', authorize('ADMIN'), validate(createProviderSchema), createProvider);
router.get('/:id', getProviderById);
router.put('/:id', authorize('ADMIN'), validate(updateProviderSchema), updateProvider);
router.delete('/:id', authorize('ADMIN'), deleteProvider);

export default router;
