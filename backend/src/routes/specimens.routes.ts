import { Router } from "express";
import { SpecimenController } from "../controllers/specimen.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();
const specimenController = new SpecimenController();

router.use(authenticateToken);

// Specimens
router.get("/", specimenController.getAllSpecimens);
router.get("/stats", specimenController.getSpecimenStats);
router.get("/barcode/:barcode", specimenController.getSpecimenByBarcode);
router.get("/:id", specimenController.getSpecimenById);
router.post("/", specimenController.createSpecimen);
router.post("/:id/receive", specimenController.receiveSpecimen);
router.post("/:id/reject", specimenController.rejectSpecimen);

export default router;
