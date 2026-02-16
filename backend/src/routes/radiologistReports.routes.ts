import { Router } from "express";
import { RadiologistReportController } from "../controllers/radiologistReport.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();
const radiologistReportController = new RadiologistReportController();

router.use(authenticateToken);

// Radiologist Reports
router.get("/", radiologistReportController.getAllReports);
router.get("/stats", radiologistReportController.getReportStats);
router.get("/critical", radiologistReportController.getCriticalReports);
router.get("/:id", radiologistReportController.getReportById);
router.post("/", radiologistReportController.createReport);
router.patch("/:id", radiologistReportController.updateReport);
router.post("/:id/submit", radiologistReportController.submitReport);
router.post("/:id/verify", radiologistReportController.verifyReport);
router.post("/:id/notify", radiologistReportController.markNotificationSent);

export default router;
