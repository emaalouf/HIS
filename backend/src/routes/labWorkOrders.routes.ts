import { Router } from "express";
import { LabWorkOrderController } from "../controllers/labWorkOrder.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();
const labWorkOrderController = new LabWorkOrderController();

router.use(authenticateToken);

// Work Orders
router.get("/", labWorkOrderController.getAllWorkOrders);
router.get("/stats", labWorkOrderController.getWorkOrderStats);
router.get("/number/:orderNumber", labWorkOrderController.getWorkOrderByNumber);
router.get("/:id", labWorkOrderController.getWorkOrderById);
router.post("/", labWorkOrderController.createWorkOrder);
router.patch("/:id", labWorkOrderController.updateWorkOrder);
router.post("/:id/verify", labWorkOrderController.verifyWorkOrder);
router.post("/:id/cancel", labWorkOrderController.cancelWorkOrder);

export default router;
