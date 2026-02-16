import { Request, Response } from "express";
import { PurchaseOrderService, createPurchaseOrderSchema, updatePurchaseOrderSchema, approvePurchaseOrderSchema, receivePurchaseOrderSchema } from "../services/purchaseOrder.service";
import { ZodError } from "zod";

const purchaseOrderService = new PurchaseOrderService();

export class PurchaseOrderController {
  async getAllPurchaseOrders(req: Request, res: Response) {
    try {
      const {
        page = "1",
        limit = "20",
        status,
        supplierId,
        fromDate,
        toDate,
        search,
      } = req.query;

      const result = await purchaseOrderService.getAllPurchaseOrders(
        {
          status: status as string,
          supplierId: supplierId as string,
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
      console.error("Error getting purchase orders:", error);
      res.status(500).json({ error: "Failed to get purchase orders" });
    }
  }

  async getPurchaseOrderById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const po = await purchaseOrderService.getPurchaseOrderById(id);

      if (!po) {
        res.status(404).json({ error: "Purchase order not found" });
        return;
      }

      res.json(po);
    } catch (error) {
      console.error("Error getting purchase order:", error);
      res.status(500).json({ error: "Failed to get purchase order" });
    }
  }

  async createPurchaseOrder(req: Request, res: Response) {
    try {
      const validatedData = createPurchaseOrderSchema.parse(req.body);
      const requestedById = req.user?.id;

      if (!requestedById) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const po = await purchaseOrderService.createPurchaseOrder(validatedData, requestedById);
      res.status(201).json(po);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
        return;
      }
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
        return;
      }
      console.error("Error creating purchase order:", error);
      res.status(500).json({ error: "Failed to create purchase order" });
    }
  }

  async updatePurchaseOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = updatePurchaseOrderSchema.parse(req.body);
      const po = await purchaseOrderService.updatePurchaseOrder(id, validatedData);
      res.json(po);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
        return;
      }
      if (error instanceof Error) {
        if (error.message === "Purchase order not found") {
          res.status(404).json({ error: error.message });
          return;
        }
        res.status(400).json({ error: error.message });
        return;
      }
      console.error("Error updating purchase order:", error);
      res.status(500).json({ error: "Failed to update purchase order" });
    }
  }

  async approvePurchaseOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = approvePurchaseOrderSchema.parse(req.body);
      const po = await purchaseOrderService.approvePurchaseOrder(id, validatedData);
      res.json(po);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
        return;
      }
      if (error instanceof Error) {
        if (error.message === "Purchase order not found") {
          res.status(404).json({ error: error.message });
          return;
        }
        res.status(400).json({ error: error.message });
        return;
      }
      console.error("Error approving purchase order:", error);
      res.status(500).json({ error: "Failed to approve purchase order" });
    }
  }

  async sendToSupplier(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const po = await purchaseOrderService.sendToSupplier(id);
      res.json(po);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Purchase order not found") {
          res.status(404).json({ error: error.message });
          return;
        }
        res.status(400).json({ error: error.message });
        return;
      }
      console.error("Error sending purchase order to supplier:", error);
      res.status(500).json({ error: "Failed to send purchase order to supplier" });
    }
  }

  async receivePurchaseOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = receivePurchaseOrderSchema.parse(req.body);
      const receivedById = req.user?.id;

      if (!receivedById) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const po = await purchaseOrderService.receivePurchaseOrder(id, validatedData, receivedById);
      res.json(po);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
        return;
      }
      if (error instanceof Error) {
        if (error.message === "Purchase order not found") {
          res.status(404).json({ error: error.message });
          return;
        }
        res.status(400).json({ error: error.message });
        return;
      }
      console.error("Error receiving purchase order:", error);
      res.status(500).json({ error: "Failed to receive purchase order" });
    }
  }

  async cancelPurchaseOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const po = await purchaseOrderService.cancelPurchaseOrder(id, reason);
      res.json(po);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Purchase order not found") {
          res.status(404).json({ error: error.message });
          return;
        }
        res.status(400).json({ error: error.message });
        return;
      }
      console.error("Error cancelling purchase order:", error);
      res.status(500).json({ error: "Failed to cancel purchase order" });
    }
  }

  async closePurchaseOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const po = await purchaseOrderService.closePurchaseOrder(id);
      res.json(po);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Purchase order not found") {
          res.status(404).json({ error: error.message });
          return;
        }
        res.status(400).json({ error: error.message });
        return;
      }
      console.error("Error closing purchase order:", error);
      res.status(500).json({ error: "Failed to close purchase order" });
    }
  }

  async getPurchaseOrderStats(req: Request, res: Response) {
    try {
      const stats = await purchaseOrderService.getPurchaseOrderStats();
      res.json(stats);
    } catch (error) {
      console.error("Error getting purchase order stats:", error);
      res.status(500).json({ error: "Failed to get purchase order stats" });
    }
  }
}
