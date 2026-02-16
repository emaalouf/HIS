import { Router } from "express";
import { ReferenceRangeController } from "../controllers/referenceRange.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();
const referenceRangeController = new ReferenceRangeController();

router.use(authenticateToken);

// Reference Ranges
router.get("/", referenceRangeController.getAllRanges);
router.get("/test/:testId", referenceRangeController.getRangesByTestId);
router.get("/:id", referenceRangeController.getRangeById);
router.post("/", referenceRangeController.createRange);
router.patch("/:id", referenceRangeController.updateRange);
router.delete("/:id", referenceRangeController.deleteRange);

export default router;
