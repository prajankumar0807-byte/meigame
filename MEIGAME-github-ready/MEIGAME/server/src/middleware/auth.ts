import type { NextFunction, Response } from "express";
import { prisma } from "../db.js";
import { AppError } from "../utils/errors.js";
import { COOKIE, verifyToken } from "../utils/auth.js";
import type { AuthRequest } from "../types.js";

export async function requireAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[COOKIE];
    if (!token) throw new AppError(401, "Authentication required.");
    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { permissions: true }
    });
    if (!user || !user.isActive) throw new AppError(401, "Account is inactive or unavailable.");
    req.auth = {
      id: user.id,
      username: user.username,
      role: user.role,
      permissions: user.permissions.map(p => p.permission)
    };
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.auth || !roles.includes(req.auth.role)) return next(new AppError(403, "Access denied."));
    next();
  };
}

export function requirePermission(permission: string) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.auth) return next(new AppError(401, "Authentication required."));
    if (req.auth.role === "SUPER_ADMIN" || req.auth.permissions.includes(permission as never)) return next();
    next(new AppError(403, "You do not have permission to perform this action."));
  };
}
