import { Router } from "express";
import { LabResultController } from "../controllers/labResult.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();
const labResultController = new LabResultController();

router.use(authenticateToken);

// Lab Results
router.get("/", labResultController.getAllResults);
router.get("/stats", labResultController.getResultStats);
router.get("/critical", labResultController.getCriticalResults);
router.get("/patient/:patientId", labResultController.getPatientResults);
router.get("/:id", labResultController.getResultById);
router.post("/", labResultController.createResult);
router.patch("/:id", labResultController.updateResult);
router.post("/:id/finalize", labResultController.finalizeResult);
router.post("/:id/review", labResultController.reviewResult);

export default router;
