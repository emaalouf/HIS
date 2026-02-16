import { Request, Response } from "express";
import { RadiologistReportService, createRadiologistReportSchema, updateRadiologistReportSchema } from "../services/radiologistReport.service";
import { ZodError } from "zod";

const radiologistReportService = new RadiologistReportService();

export class RadiologistReportController {
  async getAllReports(req: Request, res: Response) {
    try {
      const {
        page = "1",
        limit = "20",
        studyId,
        radiologistId,
        status,
        criticalOnly,
        search,
        dateFrom,
        dateTo,
      } = req.query;

      const result = await radiologistReportService.getAllReports(
        {
          studyId: studyId as string,
          radiologistId: radiologistId as string,
          status: status as string,
          criticalOnly: criticalOnly === "true",
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
      console.error("Error getting radiologist reports:", error);
      res.status(500).json({ error: "Failed to get radiologist reports" });
    }
  }

  async getReportById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const report = await radiologistReportService.getReportById(id);
      res.json(report);
    } catch (error) {
      if (error instanceof Error && error.message === "Report not found") {
        res.status(404).json({ error: "Report not found" });
        return;
      }
      console.error("Error getting radiologist report:", error);
      res.status(500).json({ error: "Failed to get radiologist report" });
    }
  }

  async createReport(req: Request, res: Response) {
    try {
      const validatedData = createRadiologistReportSchema.parse(req.body);
      const userId = (req as any).user?.id as string;

      if (!userId) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      const report = await radiologistReportService.createReport(validatedData, userId);
      res.status(201).json(report);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
        return;
      }
      console.error("Error creating radiologist report:", error);
      res.status(500).json({ error: "Failed to create radiologist report" });
    }
  }

  async updateReport(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const validatedData = updateRadiologistReportSchema.parse(req.body);
      const report = await radiologistReportService.updateReport(id, validatedData);
      res.json(report);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
        return;
      }
      if (error instanceof Error && error.message === "Report not found") {
        res.status(404).json({ error: "Report not found" });
        return;
      }
      console.error("Error updating radiologist report:", error);
      res.status(500).json({ error: "Failed to update radiologist report" });
    }
  }

  async submitReport(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const report = await radiologistReportService.submitReport(id);
      res.json(report);
    } catch (error) {
      if (error instanceof Error && error.message === "Report not found") {
        res.status(404).json({ error: "Report not found" });
        return;
      }
      console.error("Error submitting radiologist report:", error);
      res.status(500).json({ error: "Failed to submit radiologist report" });
    }
  }

  async verifyReport(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const userId = (req as any).user?.id as string;

      if (!userId) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      const report = await radiologistReportService.verifyReport(id, userId);
      res.json(report);
    } catch (error) {
      if (error instanceof Error && error.message === "Report not found") {
        res.status(404).json({ error: "Report not found" });
        return;
      }
      console.error("Error verifying radiologist report:", error);
      res.status(500).json({ error: "Failed to verify radiologist report" });
    }
  }

  async getCriticalReports(req: Request, res: Response) {
    try {
      const reports = await radiologistReportService.getCriticalReports();
      res.json(reports);
    } catch (error) {
      console.error("Error getting critical reports:", error);
      res.status(500).json({ error: "Failed to get critical reports" });
    }
  }

  async markNotificationSent(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const report = await radiologistReportService.markNotificationSent(id);
      res.json(report);
    } catch (error) {
      console.error("Error marking notification sent:", error);
      res.status(500).json({ error: "Failed to mark notification sent" });
    }
  }

  async getReportStats(req: Request, res: Response) {
    try {
      const stats = await radiologistReportService.getReportStats();
      res.json(stats);
    } catch (error) {
      console.error("Error getting report stats:", error);
      res.status(500).json({ error: "Failed to get report stats" });
    }
  }
}
