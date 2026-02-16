import { Router } from "express";
import { ImagingStudyController } from "../controllers/imagingStudy.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();
const imagingStudyController = new ImagingStudyController();

router.use(authenticateToken);

// Imaging Studies
router.get("/", imagingStudyController.getAllStudies);
router.get("/stats", imagingStudyController.getStudyStats);
router.get("/pending", imagingStudyController.getPendingStudies);
router.get("/unreported", imagingStudyController.getUnreportedStudies);
router.get("/accession/:accessionNumber", imagingStudyController.getStudyByAccessionNumber);
router.get("/:id", imagingStudyController.getStudyById);
router.post("/", imagingStudyController.createStudy);
router.patch("/:id", imagingStudyController.updateStudy);
router.delete("/:id", imagingStudyController.deleteStudy);

export default router;
