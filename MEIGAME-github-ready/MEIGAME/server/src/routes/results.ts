import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth, requirePermission } from "../middleware/auth.js";
import type { AuthRequest } from "../types.js";

const router = Router();
router.use(requireAuth, requirePermission("VIEW_RESULTS"));

router.get("/quiz/:quizId", async (req, res, next) => {
  try {
    const results = await prisma.quizResult.findMany({
      where: { quizId: req.params.quizId },
      orderBy: [{ score: "desc" }, { timeTaken: "asc" }],
      include: { participant: { select: { id: true, name: true, collegeId: true } } }
    });
    res.json({ results });
  } catch (e) { next(e); }
});

export default router;
