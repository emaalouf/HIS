import { Request, Response } from "express";
import {
  LabResultService,
  createLabResultSchema,
  updateLabResultSchema,
  reviewLabResultSchema,
} from "../services/labResult.service";
import { ZodError } from "zod";

const labResultService = new LabResultService();

export class LabResultController {
  async getAllResults(req: Request, res: Response) {
    try {
      const {
        page = "1",
        limit = "20",
        patientId,
        workOrderId,
        testId,
        status,
        flag,
        search,
        dateFrom,
        dateTo,
      } = req.query;

      const result = await labResultService.getAllResults(
        {
          patientId: patientId as string,
          workOrderId: workOrderId as string,
          testId: testId as string,
          status: status as string,
          flag: flag as string,
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
      console.error("Error getting results:", error);
      res.status(500).json({ error: "Failed to get results" });
    }
  }

  async getResultById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await labResultService.getResultById(id);
      res.json(result);
    } catch (error) {
      if (error instanceof Error && error.message === "Lab result not found") {
        res.status(404).json({ error: "Lab result not found" });
        return;
      }
      console.error("Error getting result:", error);
      res.status(500).json({ error: "Failed to get result" });
    }
  }

  async getPatientResults(req: Request, res: Response) {
    try {
      const { patientId } = req.params;
      const {
        page = "1",
        limit = "20",
        testId,
        dateFrom,
        dateTo,
      } = req.query;

      const result = await labResultService.getPatientResults(
        patientId,
        {
          testId: testId as string,
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
      console.error("Error getting patient results:", error);
      res.status(500).json({ error: "Failed to get patient results" });
    }
  }

  async createResult(req: Request, res: Response) {
    try {
      const validatedData = createLabResultSchema.parse(req.body);
      const userId = (req as any).user?.id as string;

      if (!userId) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      const result = await labResultService.createResult(validatedData, userId);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
        return;
      }
      console.error("Error creating result:", error);
      res.status(500).json({ error: "Failed to create result" });
    }
  }

  async updateResult(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const validatedData = updateLabResultSchema.parse(req.body);
      const result = await labResultService.updateResult(id, validatedData);
      res.json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
        return;
      }
      if (error instanceof Error && error.message === "Lab result not found") {
        res.status(404).json({ error: "Lab result not found" });
        return;
      }
      console.error("Error updating result:", error);
      res.status(500).json({ error: "Failed to update result" });
    }
  }

  async finalizeResult(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await labResultService.finalizeResult(id);
      res.json(result);
    } catch (error) {
      if (error instanceof Error && error.message === "Lab result not found") {
        res.status(404).json({ error: "Lab result not found" });
        return;
      }
      console.error("Error finalizing result:", error);
      res.status(500).json({ error: "Failed to finalize result" });
    }
  }

  async reviewResult(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const validatedData = reviewLabResultSchema.parse(req.body);
      const userId = (req as any).user?.id as string;

      if (!userId) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      const result = await labResultService.reviewResult(id, validatedData, userId);
      res.json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
        return;
      }
      if (error instanceof Error && error.message === "Lab result not found") {
        res.status(404).json({ error: "Lab result not found" });
        return;
      }
      console.error("Error reviewing result:", error);
      res.status(500).json({ error: "Failed to review result" });
    }
  }

  async getCriticalResults(req: Request, res: Response) {
    try {
      const results = await labResultService.getCriticalResults();
      res.json(results);
    } catch (error) {
      console.error("Error getting critical results:", error);
      res.status(500).json({ error: "Failed to get critical results" });
    }
  }

  async getResultStats(req: Request, res: Response) {
    try {
      const stats = await labResultService.getResultStats();
      res.json(stats);
    } catch (error) {
      console.error("Error getting result stats:", error);
      res.status(500).json({ error: "Failed to get result stats" });
    }
  }
}
