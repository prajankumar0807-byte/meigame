import { prisma } from "../db.js";
import type { AuthRequest } from "../types.js";

export async function logActivity(req: AuthRequest, action: string, targetType?: string, targetId?: string, metadata?: unknown) {
  await prisma.activityLog.create({
    data: {
      userId: req.auth?.id,
      action,
      targetType,
      targetId,
      metadata: metadata as object | undefined,
      ipAddress: req.ip,
      userAgent: req.get("user-agent") ?? undefined
    }
  });
}
