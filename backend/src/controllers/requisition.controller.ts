import { Request, Response } from "express";
import { RequisitionService, createRequisitionSchema, updateRequisitionSchema, approveRequisitionSchema, fulfillRequisitionSchema } from "../services/requisition.service";
import { ZodError } from "zod";

const requisitionService = new RequisitionService();

export class RequisitionController {
  async getAllRequisitions(req: Request, res: Response) {
    try {
      const {
        page = "1",
        limit = "20",
        status,
        departmentId,
        priority,
        fromDate,
        toDate,
        search,
      } = req.query;

      const result = await requisitionService.getAllRequisitions(
        {
          status: status as string,
          departmentId: departmentId as string,
          priority: priority as string,
          fromDate: fromDate ? new Date(fromDate as string) : undefined,
          toDate: toDate ? new Date(toDate as string) : undefined,
          search: search as string,
        },
        {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
        }
      );

      res.json(result);
    } catch (error) {
      console.error("Error getting requisitions:", error);
      res.status(500).json({ error: "Failed to get requisitions" });
    }
  }

  async getRequisitionById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const requisition = await requisitionService.getRequisitionById(id);

      if (!requisition) {
        res.status(404).json({ error: "Requisition not found" });
        return;
      }

      res.json(requisition);
    } catch (error) {
      console.error("Error getting requisition:", error);
      res.status(500).json({ error: "Failed to get requisition" });
    }
  }

  async createRequisition(req: Request, res: Response) {
    try {
      const validatedData = createRequisitionSchema.parse(req.body);
      const requestedById = req.user?.id;

      if (!requestedById) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const requisition = await requisitionService.createRequisition(validatedData, requestedById);
      res.status(201).json(requisition);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
        return;
      }
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
        return;
      }
      console.error("Error creating requisition:", error);
      res.status(500).json({ error: "Failed to create requisition" });
    }
  }

  async updateRequisition(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = updateRequisitionSchema.parse(req.body);
      const requisition = await requisitionService.updateRequisition(id, validatedData);
      res.json(requisition);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
        return;
      }
      if (error instanceof Error) {
        if (error.message === "Requisition not found") {
          res.status(404).json({ error: error.message });
          return;
        }
        res.status(400).json({ error: error.message });
        return;
      }
      console.error("Error updating requisition:", error);
      res.status(500).json({ error: "Failed to update requisition" });
    }
  }

  async submitRequisition(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const requisition = await requisitionService.submitRequisition(id);
      res.json(requisition);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Requisition not found") {
          res.status(404).json({ error: error.message });
          return;
        }
        res.status(400).json({ error: error.message });
        return;
      }
      console.error("Error submitting requisition:", error);
      res.status(500).json({ error: "Failed to submit requisition" });
    }
  }

  async approveRequisition(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = approveRequisitionSchema.parse(req.body);
      const requisition = await requisitionService.approveRequisition(id, validatedData);
      res.json(requisition);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
        return;
      }
      if (error instanceof Error) {
        if (error.message === "Requisition not found") {
          res.status(404).json({ error: error.message });
          return;
        }
        res.status(400).json({ error: error.message });
        return;
      }
      console.error("Error approving requisition:", error);
      res.status(500).json({ error: "Failed to approve requisition" });
    }
  }

  async rejectRequisition(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const approvedById = req.user?.id;

      if (!approvedById) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const requisition = await requisitionService.rejectRequisition(id, approvedById, reason);
      res.json(requisition);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Requisition not found") {
          res.status(404).json({ error: error.message });
          return;
        }
        res.status(400).json({ error: error.message });
        return;
      }
      console.error("Error rejecting requisition:", error);
      res.status(500).json({ error: "Failed to reject requisition" });
    }
  }

  async fulfillRequisition(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = fulfillRequisitionSchema.parse(req.body);
      const fulfilledById = req.user?.id;

      if (!fulfilledById) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const requisition = await requisitionService.fulfillRequisition(id, validatedData, fulfilledById);
      res.json(requisition);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
        return;
      }
      if (error instanceof Error) {
        if (error.message === "Requisition not found") {
          res.status(404).json({ error: error.message });
          return;
        }
        res.status(400).json({ error: error.message });
        return;
      }
      console.error("Error fulfilling requisition:", error);
      res.status(500).json({ error: "Failed to fulfill requisition" });
    }
  }

  async cancelRequisition(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const requisition = await requisitionService.cancelRequisition(id, reason);
      res.json(requisition);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Requisition not found") {
          res.status(404).json({ error: error.message });
          return;
        }
        res.status(400).json({ error: error.message });
        return;
      }
      console.error("Error cancelling requisition:", error);
      res.status(500).json({ error: "Failed to cancel requisition" });
    }
  }

  async getRequisitionStats(req: Request, res: Response) {
    try {
      const stats = await requisitionService.getRequisitionStats();
      res.json(stats);
    } catch (error) {
      console.error("Error getting requisition stats:", error);
      res.status(500).json({ error: "Failed to get requisition stats" });
    }
  }
}
