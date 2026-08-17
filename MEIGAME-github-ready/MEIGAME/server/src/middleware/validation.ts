import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { AppError } from "../utils/errors.js";

export function validate(schema: ZodType) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync(req.body);
      req.body = parsed;
      next();
    } catch (error) {
      next(new AppError(400, error instanceof Error ? error.message : "Invalid request."));
    }
  };
}
