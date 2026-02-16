import { Router } from "express";
import { EDVisitController } from "../controllers/edVisit.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();
const edVisitController = new EDVisitController();

router.use(authenticateToken);

// ED Visits
router.get("/", edVisitController.getAllVisits);
router.get("/stats", edVisitController.getVisitStats);
router.get("/active", edVisitController.getActiveVisits);
router.get("/:id", edVisitController.getVisitById);
router.post("/", edVisitController.createVisit);
router.patch("/:id", edVisitController.updateVisit);

export default router;
