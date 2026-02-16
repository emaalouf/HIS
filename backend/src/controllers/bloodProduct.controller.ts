import { Request, Response } from "express";
import { BloodProductService, createBloodProductSchema, updateBloodProductSchema } from "../services/bloodProduct.service";
import { ZodError } from "zod";

const bloodProductService = new BloodProductService();

export class BloodProductController {
  async getAllProducts(req: Request, res: Response) {
    try {
      const {
        page = "1",
        limit = "20",
        productType,
        bloodType,
        status,
        search,
        expiringBefore,
      } = req.query;

      const result = await bloodProductService.getAllProducts(
        {
          productType: productType as string,
          bloodType: bloodType as string,
          status: status as string,
          search: search as string,
          expiringBefore: expiringBefore ? new Date(expiringBefore as string) : undefined,
        },
        {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
        }
      );

      res.json(result);
    } catch (error) {
      console.error("Error getting blood products:", error);
      res.status(500).json({ error: "Failed to get blood products" });
    }
  }

  async getProductById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const product = await bloodProductService.getProductById(id);
      res.json(product);
    } catch (error) {
      if (error instanceof Error && error.message === "Blood product not found") {
        res.status(404).json({ error: "Blood product not found" });
        return;
      }
      console.error("Error getting blood product:", error);
      res.status(500).json({ error: "Failed to get blood product" });
    }
  }

  async createProduct(req: Request, res: Response) {
    try {
      const validatedData = createBloodProductSchema.parse(req.body);
      const product = await bloodProductService.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
        return;
      }
      console.error("Error creating blood product:", error);
      res.status(500).json({ error: "Failed to create blood product" });
    }
  }

  async updateProduct(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const validatedData = updateBloodProductSchema.parse(req.body);
      const product = await bloodProductService.updateProduct(id, validatedData);
      res.json(product);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
        return;
      }
      if (error instanceof Error && error.message === "Blood product not found") {
        res.status(404).json({ error: "Blood product not found" });
        return;
      }
      console.error("Error updating blood product:", error);
      res.status(500).json({ error: "Failed to update blood product" });
    }
  }

  async getInventoryByBloodType(req: Request, res: Response) {
    try {
      const inventory = await bloodProductService.getInventoryByBloodType();
      res.json(inventory);
    } catch (error) {
      console.error("Error getting inventory:", error);
      res.status(500).json({ error: "Failed to get inventory" });
    }
  }

  async getExpiringProducts(req: Request, res: Response) {
    try {
      const { days = "7" } = req.query;
      const products = await bloodProductService.getExpiringProducts(parseInt(days as string));
      res.json(products);
    } catch (error) {
      console.error("Error getting expiring products:", error);
      res.status(500).json({ error: "Failed to get expiring products" });
    }
  }

  async getLowStockProducts(req: Request, res: Response) {
    try {
      const { threshold = "10" } = req.query;
      const products = await bloodProductService.getLowStockProducts(parseInt(threshold as string));
      res.json(products);
    } catch (error) {
      console.error("Error getting low stock products:", error);
      res.status(500).json({ error: "Failed to get low stock products" });
    }
  }
}
