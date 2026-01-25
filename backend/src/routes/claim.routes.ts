import { Router } from 'express';
import {
    createClaim,
    deleteClaim,
    getClaimById,
    getClaims,
    updateClaim,
} from '../controllers/claim.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createClaimSchema, updateClaimSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getClaims);
router.post('/', authorize('ADMIN', 'RECEPTIONIST'), validate(createClaimSchema), createClaim);
router.get('/:id', getClaimById);
router.put('/:id', authorize('ADMIN', 'RECEPTIONIST'), validate(updateClaimSchema), updateClaim);
router.delete('/:id', authorize('ADMIN'), deleteClaim);

export default router;
