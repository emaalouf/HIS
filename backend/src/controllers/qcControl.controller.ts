import { Request, Response } from "express";
import {
  QCControlService,
  createQCControlSchema,
  createQCResultSchema,
  reviewQCResultSchema,
} from "../services/qcControl.service";
import { ZodError } from "zod";

const qcControlService = new QCControlService();

export class QCControlController {
  async getAllControls(req: Request, res: Response) {
    try {
      const {
        page = "1",
        limit = "20",
        testId,
        isActive,
        expiringBefore,
      } = req.query;

      const result = await qcControlService.getAllControls(
        {
          testId: testId as string,
          isActive: isActive !== undefined ? isActive === "true" : undefined,
          expiringBefore: expiringBefore ? new Date(expiringBefore as string) : undefined,
        },
        {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
        }
      );

      res.json(result);
    } catch (error) {
      console.error("Error getting QC controls:", error);
      res.status(500).json({ error: "Failed to get QC controls" });
    }
  }

  async getControlById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const control = await qcControlService.getControlById(id);
      res.json(control);
    } catch (error) {
      if (error instanceof Error && error.message === "QC control not found") {
        res.status(404).json({ error: "QC control not found" });
        return;
      }
      console.error("Error getting QC control:", error);
      res.status(500).json({ error: "Failed to get QC control" });
    }
  }

  async createControl(req: Request, res: Response) {
    try {
      const validatedData = createQCControlSchema.parse(req.body);
      const control = await qcControlService.createControl(validatedData);
      res.status(201).json(control);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
        return;
      }
      if (error instanceof Error && error.message === "Lab test not found") {
        res.status(404).json({ error: "Lab test not found" });
        return;
      }
      console.error("Error creating QC control:", error);
      res.status(500).json({ error: "Failed to create QC control" });
    }
  }

  async updateControl(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const validatedData = createQCControlSchema.partial().parse(req.body);
      const control = await qcControlService.updateControl(id, validatedData);
      res.json(control);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
        return;
      }
      if (error instanceof Error && error.message === "QC control not found") {
        res.status(404).json({ error: "QC control not found" });
        return;
      }
      console.error("Error updating QC control:", error);
      res.status(500).json({ error: "Failed to update QC control" });
    }
  }

  async deactivateControl(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await qcControlService.deactivateControl(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === "QC control not found") {
        res.status(404).json({ error: "QC control not found" });
        return;
      }
      console.error("Error deactivating QC control:", error);
      res.status(500).json({ error: "Failed to deactivate QC control" });
    }
  }

  async getQCResults(req: Request, res: Response) {
    try {
      const {
        page = "1",
        limit = "20",
        controlId,
        status,
        dateFrom,
        dateTo,
      } = req.query;

      const result = await qcControlService.getQCResults(
        {
          controlId: controlId as string,
          status: status as string,
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
      console.error("Error getting QC results:", error);
      res.status(500).json({ error: "Failed to get QC results" });
    }
  }

  async createQCResult(req: Request, res: Response) {
    try {
      const validatedData = createQCResultSchema.parse(req.body);
      const userId = (req as any).user?.id as string;

      if (!userId) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      const result = await qcControlService.createQCResult(validatedData, userId);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
        return;
      }
      if (error instanceof Error && error.message === "QC control not found") {
        res.status(404).json({ error: "QC control not found" });
        return;
      }
      console.error("Error creating QC result:", error);
      res.status(500).json({ error: "Failed to create QC result" });
    }
  }

  async reviewQCResult(req: Request, res: Response) {
    try {
      const { resultId } = req.params;
      const validatedData = reviewQCResultSchema.parse(req.body);
      const userId = (req as any).user?.id as string;

      if (!userId) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      const result = await qcControlService.reviewQCResult(resultId, validatedData, userId);
      res.json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
        return;
      }
      if (error instanceof Error && error.message === "QC result not found") {
        res.status(404).json({ error: "QC result not found" });
        return;
      }
      console.error("Error reviewing QC result:", error);
      res.status(500).json({ error: "Failed to review QC result" });
    }
  }

  async getLeveyJenningsData(req: Request, res: Response) {
    try {
      const { controlId } = req.params;
      const { days = "30" } = req.query;

      const data = await qcControlService.getLeveyJenningsData(
        controlId,
        parseInt(days as string)
      );
      res.json(data);
    } catch (error) {
      if (error instanceof Error && error.message === "QC control not found") {
        res.status(404).json({ error: "QC control not found" });
        return;
      }
      console.error("Error getting Levey-Jennings data:", error);
      res.status(500).json({ error: "Failed to get Levey-Jennings data" });
    }
  }

  async getQCStats(req: Request, res: Response) {
    try {
      const stats = await qcControlService.getQCStats();
      res.json(stats);
    } catch (error) {
      console.error("Error getting QC stats:", error);
      res.status(500).json({ error: "Failed to get QC stats" });
    }
  }
}
