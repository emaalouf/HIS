import { Request, Response } from "express";
import { ImagingStudyService, createImagingStudySchema, updateImagingStudySchema } from "../services/imagingStudy.service";
import { ZodError } from "zod";

const imagingStudyService = new ImagingStudyService();

export class ImagingStudyController {
  async getAllStudies(req: Request, res: Response) {
    try {
      const {
        page = "1",
        limit = "20",
        patientId,
        status,
        modality,
        priority,
        search,
        dateFrom,
        dateTo,
      } = req.query;

      const result = await imagingStudyService.getAllStudies(
        {
          patientId: patientId as string,
          status: status as string,
          modality: modality as string,
          priority: priority as string,
          search: search as string,
          dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
          dateTo: dateTo ? new Date(dateTo as string) : undefined,
        },
        {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
        }
      );

      res.json(result);
    } catch (error) {
      console.error("Error getting imaging studies:", error);
      res.status(500).json({ error: "Failed to get imaging studies" });
    }
  }

  async getStudyById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const study = await imagingStudyService.getStudyById(id);
      res.json(study);
    } catch (error) {
      if (error instanceof Error && error.message === "Imaging study not found") {
        res.status(404).json({ error: "Imaging study not found" });
        return;
      }
      console.error("Error getting imaging study:", error);
      res.status(500).json({ error: "Failed to get imaging study" });
    }
  }

  async getStudyByAccessionNumber(req: Request, res: Response) {
    try {
      const accessionNumber = req.params.accessionNumber as string;
      const study = await imagingStudyService.getStudyByAccessionNumber(accessionNumber);
      if (!study) {
        res.status(404).json({ error: "Imaging study not found" });
        return;
      }
      res.json(study);
    } catch (error) {
      console.error("Error getting imaging study by accession number:", error);
      res.status(500).json({ error: "Failed to get imaging study" });
    }
  }

  async createStudy(req: Request, res: Response) {
    try {
      const validatedData = createImagingStudySchema.parse(req.body);
      const study = await imagingStudyService.createStudy(validatedData);
      res.status(201).json(study);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
        return;
      }
      console.error("Error creating imaging study:", error);
      res.status(500).json({ error: "Failed to create imaging study" });
    }
  }

  async updateStudy(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const validatedData = updateImagingStudySchema.parse(req.body);
      const study = await imagingStudyService.updateStudy(id, validatedData);
      res.json(study);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
        return;
      }
      if (error instanceof Error && error.message === "Imaging study not found") {
        res.status(404).json({ error: "Imaging study not found" });
        return;
      }
      console.error("Error updating imaging study:", error);
      res.status(500).json({ error: "Failed to update imaging study" });
    }
  }

  async deleteStudy(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await imagingStudyService.deleteStudy(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === "Imaging study not found") {
        res.status(404).json({ error: "Imaging study not found" });
        return;
      }
      console.error("Error deleting imaging study:", error);
      res.status(500).json({ error: "Failed to delete imaging study" });
    }
  }

  async getPendingStudies(req: Request, res: Response) {
    try {
      const studies = await imagingStudyService.getPendingStudies();
      res.json(studies);
    } catch (error) {
      console.error("Error getting pending studies:", error);
      res.status(500).json({ error: "Failed to get pending studies" });
    }
  }

  async getUnreportedStudies(req: Request, res: Response) {
    try {
      const studies = await imagingStudyService.getUnreportedStudies();
      res.json(studies);
    } catch (error) {
      console.error("Error getting unreported studies:", error);
      res.status(500).json({ error: "Failed to get unreported studies" });
    }
  }

  async getStudyStats(req: Request, res: Response) {
    try {
      const stats = await imagingStudyService.getStudyStats();
      res.json(stats);
    } catch (error) {
      console.error("Error getting study stats:", error);
      res.status(500).json({ error: "Failed to get study stats" });
    }
  }
}
