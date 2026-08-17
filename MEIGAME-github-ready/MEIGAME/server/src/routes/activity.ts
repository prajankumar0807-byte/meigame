import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth, requireRole("SUPER_ADMIN"));

router.get("/", async (_req, res, next) => {
  try {
    const logs = await prisma.activityLog.findMany({
      take: 250,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { username: true, fullName: true, role: true } } }
    });
    res.json({ logs });
  } catch (e) { next(e); }
});

export default router;
