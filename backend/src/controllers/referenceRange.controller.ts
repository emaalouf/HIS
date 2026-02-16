import { Request, Response } from "express";
import {
  ReferenceRangeService,
  createReferenceRangeSchema,
  updateReferenceRangeSchema,
} from "../services/referenceRange.service";
import { ZodError } from "zod";

const referenceRangeService = new ReferenceRangeService();

export class ReferenceRangeController {
  async getAllRanges(req: Request, res: Response) {
    try {
      const {
        page = "1",
        limit = "20",
        testId,
        gender,
        search,
      } = req.query;

      const result = await referenceRangeService.getAllRanges(
        {
          testId: testId as string,
          gender: gender as string,
          search: search as string,
        },
        {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
        }
      );

      res.json(result);
    } catch (error) {
      console.error("Error getting reference ranges:", error);
      res.status(500).json({ error: "Failed to get reference ranges" });
    }
  }

  async getRangeById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const range = await referenceRangeService.getRangeById(id);
      res.json(range);
    } catch (error) {
      if (error instanceof Error && error.message === "Reference range not found") {
        res.status(404).json({ error: "Reference range not found" });
        return;
      }
      console.error("Error getting reference range:", error);
      res.status(500).json({ error: "Failed to get reference range" });
    }
  }

  async getRangesByTestId(req: Request, res: Response) {
    try {
      const { testId } = req.params;
      const ranges = await referenceRangeService.getRangesByTestId(testId);
      res.json(ranges);
    } catch (error) {
      console.error("Error getting ranges by test ID:", error);
      res.status(500).json({ error: "Failed to get reference ranges" });
    }
  }

  async createRange(req: Request, res: Response) {
    try {
      const validatedData = createReferenceRangeSchema.parse(req.body);
      const range = await referenceRangeService.createRange(validatedData);
      res.status(201).json(range);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
        return;
      }
      if (error instanceof Error && error.message === "Lab test not found") {
        res.status(404).json({ error: "Lab test not found" });
        return;
      }
      console.error("Error creating reference range:", error);
      res.status(500).json({ error: "Failed to create reference range" });
    }
  }

  async updateRange(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const validatedData = updateReferenceRangeSchema.parse(req.body);
      const range = await referenceRangeService.updateRange(id, validatedData);
      res.json(range);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Validation error", details: error.errors });
        return;
      }
      if (error instanceof Error && error.message === "Reference range not found") {
        res.status(404).json({ error: "Reference range not found" });
        return;
      }
      console.error("Error updating reference range:", error);
      res.status(500).json({ error: "Failed to update reference range" });
    }
  }

  async deleteRange(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await referenceRangeService.deleteRange(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === "Reference range not found") {
        res.status(404).json({ error: "Reference range not found" });
        return;
      }
      console.error("Error deleting reference range:", error);
      res.status(500).json({ error: "Failed to delete reference range" });
    }
  }
}
