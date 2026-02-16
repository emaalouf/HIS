import { Router } from "express";
import { IcuAdmissionController } from "../controllers/icuAdmission.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();
const icuAdmissionController = new IcuAdmissionController();

router.use(authenticateToken);

// ICU Admissions
router.get("/", icuAdmissionController.getAllAdmissions);
router.get("/stats", icuAdmissionController.getAdmissionStats);
router.get("/active", icuAdmissionController.getActiveAdmissions);
router.get("/:id", icuAdmissionController.getAdmissionById);
router.post("/", icuAdmissionController.createAdmission);
router.patch("/:id", icuAdmissionController.updateAdmission);

export default router;
