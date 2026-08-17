import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth, requirePermission } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth, requirePermission("VIEW_ANALYTICS"));

router.get("/overview", async (_req, res, next) => {
  try {
    const [users, staff, quizzes, results] = await Promise.all([
      prisma.user.count({ where: { role: "USER" } }),
      prisma.user.count({ where: { role: "STAFF" } }),
      prisma.quiz.count(),
      prisma.quizResult.count()
    ]);
    const topQuizzes = await prisma.quiz.findMany({
      orderBy: { createdAt: "desc" }, take: 8,
      select: { id: true, title: true, status: true, subject: true, _count: { select: { participants: true, questions: true } } }
    });
    res.json({ overview: { users, staff, quizzes, results }, topQuizzes });
  } catch (e) { next(e); }
});

export default router;
