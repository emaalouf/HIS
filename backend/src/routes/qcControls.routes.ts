import { Router } from "express";
import { QCControlController } from "../controllers/qcControl.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();
const qcControlController = new QCControlController();

router.use(authenticateToken);

// QC Controls
router.get("/", qcControlController.getAllControls);
router.get("/stats", qcControlController.getQCStats);
router.get("/:id", qcControlController.getControlById);
router.post("/", qcControlController.createControl);
router.patch("/:id", qcControlController.updateControl);
router.delete("/:id", qcControlController.deactivateControl);

// QC Results
router.get("/results/list", qcControlController.getQCResults);
router.post("/results", qcControlController.createQCResult);
router.post("/results/:resultId/review", qcControlController.reviewQCResult);
router.get("/:controlId/levey-jennings", qcControlController.getLeveyJenningsData);

export default router;
