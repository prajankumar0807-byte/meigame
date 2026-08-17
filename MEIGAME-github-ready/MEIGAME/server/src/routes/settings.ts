import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { z } from "zod";

const router = Router();
router.use(requireAuth, requireRole("SUPER_ADMIN"));

router.get("/quiz/:quizId", async (req, res, next) => {
  try {
    const setting = await prisma.quizSetting.findUnique({ where: { quizId: req.params.quizId } });
    res.json({ setting });
  } catch (e) { next(e); }
});

router.patch("/quiz/:quizId", async (req, res, next) => {
  try {
    const data = z.object({
      allowLateJoin: z.boolean().optional(),
      randomizeQuestions: z.boolean().optional(),
      randomizeOptions: z.boolean().optional(),
      showCorrectAfterAnswer: z.boolean().optional()
    }).parse(req.body);
    const setting = await prisma.quizSetting.upsert({ where: { quizId: req.params.quizId }, create: { quizId: req.params.quizId, ...data }, update: data });
    res.json({ setting });
  } catch (e) { next(e); }
});

export default router;
