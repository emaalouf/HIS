import { Request, Response } from "express";
import { InventoryItemService, createInventoryItemSchema, updateInventoryItemSchema } from "../services/inventoryItem.service";
import { ZodError } from "zod";

const inventoryItemService = new InventoryItemService();

export class InventoryItemController {
  async getAllItems(req: Request, res: Response) {
    try {
      const {
        page = "1",
        limit = "20",
        category,
        status,
        search,
        lowStock,
      } = req.query;

      const result = await inventoryItemService.getAllItems(
        {
          category: category as string,
          status: status as string,
          search: search as string,
          lowStock: lowStock === "true",
        },
        {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
        }
      );

      res.json(result);
    } catch (error) {
      console.error("Error getting inventory items:", error);
      res.status(500).json({ error: "Failed to get inventory items" });
    }
  }

  async getItemById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await inventoryItemService.getItemById(id);

      if (!item) {
        res.status(404).json({ error: "Item not found" });
        return;
      }

      res.json(item);
    } catch (error) {
      console.error("Error getting inventory item:", error);
      res.status(500).json({ error: "Failed to get inventory item" });
    }
  }

  async getItemBySku(req: Request, res: Response) {
    try {
      const { sku } = req.params;
      const item = await inventoryItemService.getItemBySku(sku);

      if (!item) {
        res.status(404).json({ error: "Item not found" });
        return;
      }

      res.json(item);
    } catch (error) {
      console.error("Error getting inventory item by SKU:", error);
      res.status(500).json({ error: "Failed to get inventory item" });
    }
  }

  async createItem(req: Request, res: Response) {
    try {
      const validatedData = createInventoryItemSchema.parse(req.body);
      const item = await inventoryItemService.createItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
        return;
      }
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
        return;
      }
      console.error("Error creating inventory item:", error);
      res.status(500).json({ error: "Failed to create inventory item" });
    }
  }

  async updateItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = updateInventoryItemSchema.parse(req.body);
      const item = await inventoryItemService.updateItem(id, validatedData);
      res.json(item);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
        return;
      }
      if (error instanceof Error) {
        if (error.message === "Item not found") {
          res.status(404).json({ error: error.message });
          return;
        }
        res.status(400).json({ error: error.message });
        return;
      }
      console.error("Error updating inventory item:", error);
      res.status(500).json({ error: "Failed to update inventory item" });
    }
  }

  async deleteItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await inventoryItemService.deleteItem(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Item not found") {
          res.status(404).json({ error: error.message });
          return;
        }
        res.status(400).json({ error: error.message });
        return;
      }
      console.error("Error deleting inventory item:", error);
      res.status(500).json({ error: "Failed to delete inventory item" });
    }
  }

  async getInventoryStats(req: Request, res: Response) {
    try {
      const stats = await inventoryItemService.getInventoryStats();
      res.json(stats);
    } catch (error) {
      console.error("Error getting inventory stats:", error);
      res.status(500).json({ error: "Failed to get inventory stats" });
    }
  }

  async getItemsNeedingReorder(req: Request, res: Response) {
    try {
      const items = await inventoryItemService.getItemsNeedingReorder();
      res.json(items);
    } catch (error) {
      console.error("Error getting items needing reorder:", error);
      res.status(500).json({ error: "Failed to get items needing reorder" });
    }
  }
}
