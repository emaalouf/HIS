import { Request, Response } from "express";
import { TestPanelService, createTestPanelSchema, updateTestPanelSchema } from "../services/testPanel.service";
import { ZodError } from "zod";

const testPanelService = new TestPanelService();

export class TestPanelController {
  async getAllPanels(req: Request, res: Response) {
    try {
      const {
        page = "1",
        limit = "20",
        isActive,
        search,
      } = req.query;

      const result = await testPanelService.getAllPanels(
        {
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
      console.error("Error getting test panels:", error);
      res.status(500).json({ error: "Failed to get test panels" });
    }
  }

  async getPanelById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const panel = await testPanelService.getPanelById(id);
      res.json(panel);
    } catch (error) {
      if (error instanceof Error && error.message === "Test panel not found") {
        res.status(404).json({ error: "Test panel not found" });
        return;
      }
      console.error("Error getting test panel:", error);
      res.status(500).json({ error: "Failed to get test panel" });
    }
  }

  async createPanel(req: Request, res: Response) {
    try {
      const validatedData = createTestPanelSchema.parse(req.body);
      const panel = await testPanelService.createPanel(validatedData);
      res.status(201).json(panel);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
        return;
      }
      if (error instanceof Error && error.message.includes("already exists")) {
        res.status(409).json({ error: error.message });
        return;
      }
      console.error("Error creating test panel:", error);
      res.status(500).json({ error: "Failed to create test panel" });
    }
  }

  async updatePanel(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const validatedData = updateTestPanelSchema.parse(req.body);
      const panel = await testPanelService.updatePanel(id, validatedData);
      res.json(panel);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
        return;
      }
      if (error instanceof Error && error.message === "Test panel not found") {
        res.status(404).json({ error: "Test panel not found" });
        return;
      }
      if (error instanceof Error && error.message.includes("already exists")) {
        res.status(409).json({ error: error.message });
        return;
      }
      console.error("Error updating test panel:", error);
      res.status(500).json({ error: "Failed to update test panel" });
    }
  }

  async deletePanel(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await testPanelService.deletePanel(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === "Test panel not found") {
        res.status(404).json({ error: "Test panel not found" });
        return;
      }
      console.error("Error deleting test panel:", error);
      res.status(500).json({ error: "Failed to delete test panel" });
    }
  }
}
