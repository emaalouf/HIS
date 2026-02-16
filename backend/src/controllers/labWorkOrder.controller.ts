import { Request, Response } from "express";
import {
  LabWorkOrderService,
  createLabWorkOrderSchema,
  updateLabWorkOrderSchema,
  verifyLabWorkOrderSchema,
} from "../services/labWorkOrder.service";
import { ZodError } from "zod";

const labWorkOrderService = new LabWorkOrderService();

export class LabWorkOrderController {
  async getAllWorkOrders(req: Request, res: Response) {
    try {
      const {
        page = "1",
        limit = "20",
        patientId,
        status,
        priority,
        search,
        dateFrom,
        dateTo,
      } = req.query;

      const result = await labWorkOrderService.getAllWorkOrders(
        {
          patientId: patientId as string,
          status: status as string,
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
      console.error("Error getting work orders:", error);
      res.status(500).json({ error: "Failed to get work orders" });
    }
  }

  async getWorkOrderById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const workOrder = await labWorkOrderService.getWorkOrderById(id);
      res.json(workOrder);
    } catch (error) {
      if (error instanceof Error && error.message === "Work order not found") {
        res.status(404).json({ error: "Work order not found" });
        return;
      }
      console.error("Error getting work order:", error);
      res.status(500).json({ error: "Failed to get work order" });
    }
  }

  async getWorkOrderByNumber(req: Request, res: Response) {
    try {
      const { orderNumber } = req.params;
      const workOrder = await labWorkOrderService.getWorkOrderByNumber(orderNumber);
      if (!workOrder) {
        res.status(404).json({ error: "Work order not found" });
        return;
      }
      res.json(workOrder);
    } catch (error) {
      console.error("Error getting work order by number:", error);
      res.status(500).json({ error: "Failed to get work order" });
    }
  }

  async createWorkOrder(req: Request, res: Response) {
    try {
      const validatedData = createLabWorkOrderSchema.parse(req.body);
      const userId = (req as any).user?.id as string;

      if (!userId) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      const workOrder = await labWorkOrderService.createWorkOrder(validatedData, userId);
      res.status(201).json(workOrder);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
        return;
      }
      console.error("Error creating work order:", error);
      res.status(500).json({ error: "Failed to create work order" });
    }
  }

  async updateWorkOrder(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const validatedData = updateLabWorkOrderSchema.parse(req.body);
      const workOrder = await labWorkOrderService.updateWorkOrder(id, validatedData);
      res.json(workOrder);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
        return;
      }
      if (error instanceof Error && error.message === "Work order not found") {
        res.status(404).json({ error: "Work order not found" });
        return;
      }
      console.error("Error updating work order:", error);
      res.status(500).json({ error: "Failed to update work order" });
    }
  }

  async verifyWorkOrder(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const validatedData = verifyLabWorkOrderSchema.parse(req.body);
      const userId = (req as any).user?.id as string;

      if (!userId) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      const workOrder = await labWorkOrderService.verifyWorkOrder(id, validatedData, userId);
      res.json(workOrder);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
        return;
      }
      if (error instanceof Error && error.message === "Work order not found") {
        res.status(404).json({ error: "Work order not found" });
        return;
      }
      console.error("Error verifying work order:", error);
      res.status(500).json({ error: "Failed to verify work order" });
    }
  }

  async cancelWorkOrder(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { reason } = req.body;
      const userId = (req as any).user?.id as string;

      if (!userId) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      if (!reason) {
        res.status(400).json({ error: "Cancellation reason is required" });
        return;
      }

      const workOrder = await labWorkOrderService.cancelWorkOrder(id, reason, userId);
      res.json(workOrder);
    } catch (error) {
      if (error instanceof Error && error.message === "Work order not found") {
        res.status(404).json({ error: "Work order not found" });
        return;
      }
      console.error("Error cancelling work order:", error);
      res.status(500).json({ error: "Failed to cancel work order" });
    }
  }

  async getWorkOrderStats(req: Request, res: Response) {
    try {
      const stats = await labWorkOrderService.getWorkOrderStats();
      res.json(stats);
    } catch (error) {
      console.error("Error getting work order stats:", error);
      res.status(500).json({ error: "Failed to get work order stats" });
    }
  }
}
