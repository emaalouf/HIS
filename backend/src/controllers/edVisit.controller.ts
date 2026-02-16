import { Request, Response } from "express";
import { EDVisitService, createEDVisitSchema, updateEDVisitSchema } from "../services/edVisit.service";
import { ZodError } from "zod";

const edVisitService = new EDVisitService();

export class EDVisitController {
  async getAllVisits(req: Request, res: Response) {
    try {
      const {
        page = "1",
        limit = "20",
        patientId,
        status,
        triageLevel,
        assignedProviderId,
        search,
        dateFrom,
        dateTo,
      } = req.query;

      const result = await edVisitService.getAllVisits(
        {
          patientId: patientId as string,
          status: status as string,
          triageLevel: triageLevel as string,
          assignedProviderId: assignedProviderId as string,
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
      console.error("Error getting ED visits:", error);
      res.status(500).json({ error: "Failed to get ED visits" });
    }
  }

  async getVisitById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const visit = await edVisitService.getVisitById(id);
      res.json(visit);
    } catch (error) {
      if (error instanceof Error && error.message === "ED Visit not found") {
        res.status(404).json({ error: "ED Visit not found" });
        return;
      }
      console.error("Error getting ED visit:", error);
      res.status(500).json({ error: "Failed to get ED visit" });
    }
  }

  async createVisit(req: Request, res: Response) {
    try {
      const validatedData = createEDVisitSchema.parse(req.body);
      const visit = await edVisitService.createVisit(validatedData);
      res.status(201).json(visit);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
        return;
      }
      console.error("Error creating ED visit:", error);
      res.status(500).json({ error: "Failed to create ED visit" });
    }
  }

  async updateVisit(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const validatedData = updateEDVisitSchema.parse(req.body);
      const visit = await edVisitService.updateVisit(id, validatedData);
      res.json(visit);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
        return;
      }
      if (error instanceof Error && error.message === "ED Visit not found") {
        res.status(404).json({ error: "ED Visit not found" });
        return;
      }
      console.error("Error updating ED visit:", error);
      res.status(500).json({ error: "Failed to update ED visit" });
    }
  }

  async getActiveVisits(req: Request, res: Response) {
    try {
      const visits = await edVisitService.getActiveVisits();
      res.json(visits);
    } catch (error) {
      console.error("Error getting active ED visits:", error);
      res.status(500).json({ error: "Failed to get active ED visits" });
    }
  }

  async getVisitStats(req: Request, res: Response) {
    try {
      const stats = await edVisitService.getVisitStats();
      res.json(stats);
    } catch (error) {
      console.error("Error getting ED visit stats:", error);
      res.status(500).json({ error: "Failed to get ED visit stats" });
    }
  }
}
