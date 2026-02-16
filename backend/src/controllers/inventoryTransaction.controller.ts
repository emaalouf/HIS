import { Request, Response } from "express";
import { InventoryTransactionService, createTransactionSchema, transferStockSchema, adjustStockSchema } from "../services/inventoryTransaction.service";
import { ZodError } from "zod";

const inventoryTransactionService = new InventoryTransactionService();

export class InventoryTransactionController {
  async getAllTransactions(req: Request, res: Response) {
    try {
      const {
        page = "1",
        limit = "20",
        transactionType,
        itemId,
        locationId,
        fromDate,
        toDate,
        referenceType,
        search,
      } = req.query;

      const result = await inventoryTransactionService.getAllTransactions(
        {
          transactionType: transactionType as string,
          itemId: itemId as string,
          locationId: locationId as string,
          fromDate: fromDate ? new Date(fromDate as string) : undefined,
          toDate: toDate ? new Date(toDate as string) : undefined,
          referenceType: referenceType as string,
          search: search as string,
        },
        {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
        }
      );

      res.json(result);
    } catch (error) {
      console.error("Error getting inventory transactions:", error);
      res.status(500).json({ error: "Failed to get inventory transactions" });
    }
  }

  async getTransactionById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const transaction = await inventoryTransactionService.getTransactionById(id);

      if (!transaction) {
        res.status(404).json({ error: "Transaction not found" });
        return;
      }

      res.json(transaction);
    } catch (error) {
      console.error("Error getting inventory transaction:", error);
      res.status(500).json({ error: "Failed to get inventory transaction" });
    }
  }

  async createTransaction(req: Request, res: Response) {
    try {
      const validatedData = createTransactionSchema.parse(req.body);
      const performedById = req.user?.id; // Assuming auth middleware sets req.user

      if (!performedById) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const transaction = await inventoryTransactionService.createTransaction(validatedData, performedById);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
        return;
      }
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
        return;
      }
      console.error("Error creating inventory transaction:", error);
      res.status(500).json({ error: "Failed to create inventory transaction" });
    }
  }

  async transferStock(req: Request, res: Response) {
    try {
      const validatedData = transferStockSchema.parse(req.body);
      const performedById = req.user?.id;

      if (!performedById) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const result = await inventoryTransactionService.transferStock(validatedData, performedById);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
        return;
      }
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
        return;
      }
      console.error("Error transferring stock:", error);
      res.status(500).json({ error: "Failed to transfer stock" });
    }
  }

  async adjustStock(req: Request, res: Response) {
    try {
      const validatedData = adjustStockSchema.parse(req.body);
      const performedById = req.user?.id;

      if (!performedById) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const transaction = await inventoryTransactionService.adjustStock(validatedData, performedById);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
        return;
      }
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
        return;
      }
      console.error("Error adjusting stock:", error);
      res.status(500).json({ error: "Failed to adjust stock" });
    }
  }

  async getTransactionStats(req: Request, res: Response) {
    try {
      const { fromDate, toDate } = req.query;
      const stats = await inventoryTransactionService.getTransactionStats(
        fromDate ? new Date(fromDate as string) : undefined,
        toDate ? new Date(toDate as string) : undefined
      );
      res.json(stats);
    } catch (error) {
      console.error("Error getting transaction stats:", error);
      res.status(500).json({ error: "Failed to get transaction stats" });
    }
  }
}
