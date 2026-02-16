import { Request, Response } from "express";
import { InventoryLocationService, createInventoryLocationSchema, updateInventoryLocationSchema } from "../services/inventoryLocation.service";
import { ZodError } from "zod";

const inventoryLocationService = new InventoryLocationService();

export class InventoryLocationController {
  async getAllLocations(req: Request, res: Response) {
    try {
      const {
        page = "1",
        limit = "50",
        locationType,
        isActive,
        search,
      } = req.query;

      const result = await inventoryLocationService.getAllLocations(
        {
          locationType: locationType as string,
          isActive: isActive !== undefined ? isActive === "true" : undefined,
          search: search as string,
        },
        {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
        }
      );

      res.json(result);
    } catch (error) {
      console.error("Error getting inventory locations:", error);
      res.status(500).json({ error: "Failed to get inventory locations" });
    }
  }

  async getAllLocationsTree(req: Request, res: Response) {
    try {
      const locations = await inventoryLocationService.getAllLocationsTree();
      res.json(locations);
    } catch (error) {
      console.error("Error getting inventory locations tree:", error);
      res.status(500).json({ error: "Failed to get inventory locations tree" });
    }
  }

  async getLocationById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const location = await inventoryLocationService.getLocationById(id);

      if (!location) {
        res.status(404).json({ error: "Location not found" });
        return;
      }

      res.json(location);
    } catch (error) {
      console.error("Error getting inventory location:", error);
      res.status(500).json({ error: "Failed to get inventory location" });
    }
  }

  async getLocationByCode(req: Request, res: Response) {
    try {
      const { code } = req.params;
      const location = await inventoryLocationService.getLocationByCode(code);

      if (!location) {
        res.status(404).json({ error: "Location not found" });
        return;
      }

      res.json(location);
    } catch (error) {
      console.error("Error getting inventory location by code:", error);
      res.status(500).json({ error: "Failed to get inventory location" });
    }
  }

  async createLocation(req: Request, res: Response) {
    try {
      const validatedData = createInventoryLocationSchema.parse(req.body);
      const location = await inventoryLocationService.createLocation(validatedData);
      res.status(201).json(location);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
        return;
      }
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
        return;
      }
      console.error("Error creating inventory location:", error);
      res.status(500).json({ error: "Failed to create inventory location" });
    }
  }

  async updateLocation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = updateInventoryLocationSchema.parse(req.body);
      const location = await inventoryLocationService.updateLocation(id, validatedData);
      res.json(location);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
        return;
      }
      if (error instanceof Error) {
        if (error.message === "Location not found") {
          res.status(404).json({ error: error.message });
          return;
        }
        res.status(400).json({ error: error.message });
        return;
      }
      console.error("Error updating inventory location:", error);
      res.status(500).json({ error: "Failed to update inventory location" });
    }
  }

  async deleteLocation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await inventoryLocationService.deleteLocation(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Location not found") {
          res.status(404).json({ error: error.message });
          return;
        }
        res.status(400).json({ error: error.message });
        return;
      }
      console.error("Error deleting inventory location:", error);
      res.status(500).json({ error: "Failed to delete inventory location" });
    }
  }

  async getLocationStats(req: Request, res: Response) {
    try {
      const stats = await inventoryLocationService.getLocationStats();
      res.json(stats);
    } catch (error) {
      console.error("Error getting location stats:", error);
      res.status(500).json({ error: "Failed to get location stats" });
    }
  }
}
