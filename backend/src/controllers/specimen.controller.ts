import { Request, Response } from "express";
import { SpecimenService, createSpecimenSchema, receiveSpecimenSchema } from "../services/specimen.service";
import { ZodError } from "zod";

const specimenService = new SpecimenService();

export class SpecimenController {
  async getAllSpecimens(req: Request, res: Response) {
    try {
      const {
        page = "1",
        limit = "20",
        patientId,
        status,
        specimenType,
        search,
        dateFrom,
        dateTo,
      } = req.query;

      const result = await specimenService.getAllSpecimens(
        {
          patientId: patientId as string,
          status: status as string,
          specimenType: specimenType as string,
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
      console.error("Error getting specimens:", error);
      res.status(500).json({ error: "Failed to get specimens" });
    }
  }

  async getSpecimenById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const specimen = await specimenService.getSpecimenById(id);
      res.json(specimen);
    } catch (error) {
      if (error instanceof Error && error.message === "Specimen not found") {
        res.status(404).json({ error: "Specimen not found" });
        return;
      }
      console.error("Error getting specimen:", error);
      res.status(500).json({ error: "Failed to get specimen" });
    }
  }

  async getSpecimenByBarcode(req: Request, res: Response) {
    try {
      const { barcode } = req.params;
      const specimen = await specimenService.getSpecimenByBarcode(barcode);
      if (!specimen) {
        res.status(404).json({ error: "Specimen not found" });
        return;
      }
      res.json(specimen);
    } catch (error) {
      console.error("Error getting specimen by barcode:", error);
      res.status(500).json({ error: "Failed to get specimen" });
    }
  }

  async createSpecimen(req: Request, res: Response) {
    try {
      const validatedData = createSpecimenSchema.parse(req.body);
      const userId = (req as any).user?.id as string;

      if (!userId) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      const specimen = await specimenService.createSpecimen(validatedData, userId);
      res.status(201).json(specimen);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
        return;
      }
      console.error("Error creating specimen:", error);
      res.status(500).json({ error: "Failed to create specimen" });
    }
  }

  async receiveSpecimen(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const validatedData = receiveSpecimenSchema.parse(req.body);
      const userId = (req as any).user?.id as string;

      if (!userId) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      const specimen = await specimenService.receiveSpecimen(id, validatedData, userId);
      res.json(specimen);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
        return;
      }
      if (error instanceof Error && error.message === "Specimen not found") {
        res.status(404).json({ error: "Specimen not found" });
        return;
      }
      console.error("Error receiving specimen:", error);
      res.status(500).json({ error: "Failed to receive specimen" });
    }
  }

  async rejectSpecimen(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { reason } = req.body;
      const userId = (req as any).user?.id as string;

      if (!userId) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      if (!reason) {
        res.status(400).json({ error: "Rejection reason is required" });
        return;
      }

      const specimen = await specimenService.rejectSpecimen(id, reason, userId);
      res.json(specimen);
    } catch (error) {
      if (error instanceof Error && error.message === "Specimen not found") {
        res.status(404).json({ error: "Specimen not found" });
        return;
      }
      console.error("Error rejecting specimen:", error);
      res.status(500).json({ error: "Failed to reject specimen" });
    }
  }

  async getSpecimenStats(req: Request, res: Response) {
    try {
      const stats = await specimenService.getSpecimenStats();
      res.json(stats);
    } catch (error) {
      console.error("Error getting specimen stats:", error);
      res.status(500).json({ error: "Failed to get specimen stats" });
    }
  }
}
