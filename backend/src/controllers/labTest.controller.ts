import { Request, Response } from "express";
import { LabTestService, createLabTestSchema, updateLabTestSchema } from "../services/labTest.service";
import { ZodError } from "zod";

const labTestService = new LabTestService();

export class LabTestController {
  async getAllTests(req: Request, res: Response) {
    try {
      const {
        page = "1",
        limit = "20",
        category,
        specimenType,
        isActive,
        search,
      } = req.query;

      const result = await labTestService.getAllTests(
        {
          category: category as string,
          specimenType: specimenType as string,
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
      console.error("Error getting lab tests:", error);
      res.status(500).json({ error: "Failed to get lab tests" });
    }
  }

  async getTestById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const test = await labTestService.getTestById(id);
      res.json(test);
    } catch (error) {
      if (error instanceof Error && error.message === "Lab test not found") {
        res.status(404).json({ error: "Lab test not found" });
        return;
      }
      console.error("Error getting lab test:", error);
      res.status(500).json({ error: "Failed to get lab test" });
    }
  }

  async createTest(req: Request, res: Response) {
    try {
      const validatedData = createLabTestSchema.parse(req.body);
      const test = await labTestService.createTest(validatedData);
      res.status(201).json(test);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
        return;
      }
      if (error instanceof Error && error.message.includes("already exists")) {
        res.status(409).json({ error: error.message });
        return;
      }
      console.error("Error creating lab test:", error);
      res.status(500).json({ error: "Failed to create lab test" });
    }
  }

  async updateTest(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const validatedData = updateLabTestSchema.parse(req.body);
      const test = await labTestService.updateTest(id, validatedData);
      res.json(test);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
        return;
      }
      if (error instanceof Error && error.message === "Lab test not found") {
        res.status(404).json({ error: "Lab test not found" });
        return;
      }
      if (error instanceof Error && error.message.includes("already exists")) {
        res.status(409).json({ error: error.message });
        return;
      }
      console.error("Error updating lab test:", error);
      res.status(500).json({ error: "Failed to update lab test" });
    }
  }

  async deleteTest(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await labTestService.deleteTest(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === "Lab test not found") {
        res.status(404).json({ error: "Lab test not found" });
        return;
      }
      console.error("Error deleting lab test:", error);
      res.status(500).json({ error: "Failed to delete lab test" });
    }
  }

  async getTestsByCategory(req: Request, res: Response) {
    try {
      const { category } = req.params;
      const tests = await labTestService.getTestsByCategory(category);
      res.json(tests);
    } catch (error) {
      console.error("Error getting tests by category:", error);
      res.status(500).json({ error: "Failed to get tests by category" });
    }
  }

  async getAllCategories(req: Request, res: Response) {
    try {
      const categories = await labTestService.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error getting categories:", error);
      res.status(500).json({ error: "Failed to get categories" });
    }
  }
}
