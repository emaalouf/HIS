import { Router } from "express";
import { LabTestController } from "../controllers/labTest.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();
const labTestController = new LabTestController();

router.use(authenticateToken);

// Lab Tests
router.get("/", labTestController.getAllTests);
router.get("/categories", labTestController.getAllCategories);
router.get("/category/:category", labTestController.getTestsByCategory);
router.get("/:id", labTestController.getTestById);
router.post("/", labTestController.createTest);
router.patch("/:id", labTestController.updateTest);
router.delete("/:id", labTestController.deleteTest);

export default router;
