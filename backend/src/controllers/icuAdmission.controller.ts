import { Request, Response } from "express";
import { IcuAdmissionService, createIcuAdmissionSchema, updateIcuAdmissionSchema } from "../services/icuAdmission.service";
import { ZodError } from "zod";

const icuAdmissionService = new IcuAdmissionService();

export class IcuAdmissionController {
  async getAllAdmissions(req: Request, res: Response) {
    try {
      const {
        page = "1",
        limit = "20",
        patientId,
        status,
        admissionSource,
        admittingProviderId,
        search,
        dateFrom,
        dateTo,
      } = req.query;

      const result = await icuAdmissionService.getAllAdmissions(
        {
          patientId: patientId as string,
          status: status as string,
          admissionSource: admissionSource as string,
          admittingProviderId: admittingProviderId as string,
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
      console.error("Error getting ICU admissions:", error);
      res.status(500).json({ error: "Failed to get ICU admissions" });
    }
  }

  async getAdmissionById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const admission = await icuAdmissionService.getAdmissionById(id);
      res.json(admission);
    } catch (error) {
      if (error instanceof Error && error.message === "ICU Admission not found") {
        res.status(404).json({ error: "ICU Admission not found" });
        return;
      }
      console.error("Error getting ICU admission:", error);
      res.status(500).json({ error: "Failed to get ICU admission" });
    }
  }

  async createAdmission(req: Request, res: Response) {
    try {
      const validatedData = createIcuAdmissionSchema.parse(req.body);
      const admission = await icuAdmissionService.createAdmission(validatedData);
      res.status(201).json(admission);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
        return;
      }
      console.error("Error creating ICU admission:", error);
      res.status(500).json({ error: "Failed to create ICU admission" });
    }
  }

  async updateAdmission(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const validatedData = updateIcuAdmissionSchema.parse(req.body);
      const admission = await icuAdmissionService.updateAdmission(id, validatedData);
      res.json(admission);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
        return;
      }
      if (error instanceof Error && error.message === "ICU Admission not found") {
        res.status(404).json({ error: "ICU Admission not found" });
        return;
      }
      console.error("Error updating ICU admission:", error);
      res.status(500).json({ error: "Failed to update ICU admission" });
    }
  }

  async getActiveAdmissions(req: Request, res: Response) {
    try {
      const admissions = await icuAdmissionService.getActiveAdmissions();
      res.json(admissions);
    } catch (error) {
      console.error("Error getting active ICU admissions:", error);
      res.status(500).json({ error: "Failed to get active ICU admissions" });
    }
  }

  async getAdmissionStats(req: Request, res: Response) {
    try {
      const stats = await icuAdmissionService.getAdmissionStats();
      res.json(stats);
    } catch (error) {
      console.error("Error getting ICU admission stats:", error);
      res.status(500).json({ error: "Failed to get ICU admission stats" });
    }
  }
}
