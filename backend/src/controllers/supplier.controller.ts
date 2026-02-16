import { Request, Response } from "express";
import { SupplierService, createSupplierSchema, updateSupplierSchema, addSupplierItemSchema } from "../services/supplier.service";
import { ZodError } from "zod";

const supplierService = new SupplierService();

export class SupplierController {
  async getAllSuppliers(req: Request, res: Response) {
    try {
      const {
        page = "1",
        limit = "20",
        isActive,
        isPreferred,
        search,
      } = req.query;

      const result = await supplierService.getAllSuppliers(
        {
          isActive: isActive !== undefined ? isActive === "true" : undefined,
          isPreferred: isPreferred !== undefined ? isPreferred === "true" : undefined,
          search: search as string,
        },
        {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
        }
      );

      res.json(result);
    } catch (error) {
      console.error("Error getting suppliers:", error);
      res.status(500).json({ error: "Failed to get suppliers" });
    }
  }

  async getSupplierById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const supplier = await supplierService.getSupplierById(id);

      if (!supplier) {
        res.status(404).json({ error: "Supplier not found" });
        return;
      }

      res.json(supplier);
    } catch (error) {
      console.error("Error getting supplier:", error);
      res.status(500).json({ error: "Failed to get supplier" });
    }
  }

  async getSupplierByCode(req: Request, res: Response) {
    try {
      const { code } = req.params;
      const supplier = await supplierService.getSupplierByCode(code);

      if (!supplier) {
        res.status(404).json({ error: "Supplier not found" });
        return;
      }

      res.json(supplier);
    } catch (error) {
      console.error("Error getting supplier by code:", error);
      res.status(500).json({ error: "Failed to get supplier" });
    }
  }

  async createSupplier(req: Request, res: Response) {
    try {
      const validatedData = createSupplierSchema.parse(req.body);
      const supplier = await supplierService.createSupplier(validatedData);
      res.status(201).json(supplier);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
        return;
      }
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
        return;
      }
      console.error("Error creating supplier:", error);
      res.status(500).json({ error: "Failed to create supplier" });
    }
  }

  async updateSupplier(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = updateSupplierSchema.parse(req.body);
      const supplier = await supplierService.updateSupplier(id, validatedData);
      res.json(supplier);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
        return;
      }
      if (error instanceof Error) {
        if (error.message === "Supplier not found") {
          res.status(404).json({ error: error.message });
          return;
        }
        res.status(400).json({ error: error.message });
        return;
      }
      console.error("Error updating supplier:", error);
      res.status(500).json({ error: "Failed to update supplier" });
    }
  }

  async deleteSupplier(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await supplierService.deleteSupplier(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Supplier not found") {
          res.status(404).json({ error: error.message });
          return;
        }
        res.status(400).json({ error: error.message });
        return;
      }
      console.error("Error deleting supplier:", error);
      res.status(500).json({ error: "Failed to delete supplier" });
    }
  }

  async addSupplierItem(req: Request, res: Response) {
    try {
      const validatedData = addSupplierItemSchema.parse(req.body);
      const supplierItem = await supplierService.addSupplierItem(validatedData);
      res.status(201).json(supplierItem);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
        return;
      }
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
        return;
      }
      console.error("Error adding supplier item:", error);
      res.status(500).json({ error: "Failed to add supplier item" });
    }
  }

  async updateSupplierItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const supplierItem = await supplierService.updateSupplierItem(id, req.body);
      res.json(supplierItem);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Supplier item not found") {
          res.status(404).json({ error: error.message });
          return;
        }
        res.status(400).json({ error: error.message });
        return;
      }
      console.error("Error updating supplier item:", error);
      res.status(500).json({ error: "Failed to update supplier item" });
    }
  }

  async removeSupplierItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await supplierService.removeSupplierItem(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Supplier item not found") {
          res.status(404).json({ error: error.message });
          return;
        }
        res.status(400).json({ error: error.message });
        return;
      }
      console.error("Error removing supplier item:", error);
      res.status(500).json({ error: "Failed to remove supplier item" });
    }
  }

  async getSupplierStats(req: Request, res: Response) {
    try {
      const stats = await supplierService.getSupplierStats();
      res.json(stats);
    } catch (error) {
      console.error("Error getting supplier stats:", error);
      res.status(500).json({ error: "Failed to get supplier stats" });
    }
  }

  async getSuppliersForItem(req: Request, res: Response) {
    try {
      const { itemId } = req.params;
      const suppliers = await supplierService.getSuppliersForItem(itemId);
      res.json(suppliers);
    } catch (error) {
      console.error("Error getting suppliers for item:", error);
      res.status(500).json({ error: "Failed to get suppliers for item" });
    }
  }
}
