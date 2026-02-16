import { Router } from "express";
import { TestPanelController } from "../controllers/testPanel.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();
const testPanelController = new TestPanelController();

router.use(authenticateToken);

// Test Panels
router.get("/", testPanelController.getAllPanels);
router.get("/:id", testPanelController.getPanelById);
router.post("/", testPanelController.createPanel);
router.patch("/:id", testPanelController.updatePanel);
router.delete("/:id", testPanelController.deletePanel);

export default router;
