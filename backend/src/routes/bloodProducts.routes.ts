import { Router } from "express";
import { BloodProductController } from "../controllers/bloodProduct.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();
const bloodProductController = new BloodProductController();

router.use(authenticateToken);

// Blood Products
router.get("/", bloodProductController.getAllProducts);
router.get("/inventory", bloodProductController.getInventoryByBloodType);
router.get("/expiring", bloodProductController.getExpiringProducts);
router.get("/low-stock", bloodProductController.getLowStockProducts);
router.get("/:id", bloodProductController.getProductById);
router.post("/", bloodProductController.createProduct);
router.patch("/:id", bloodProductController.updateProduct);

export default router;
