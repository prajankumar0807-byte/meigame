import { Router } from "express";
import { randomInt } from "crypto";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth, requirePermission, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validation.js";
import { AppError } from "../utils/errors.js";
import { logActivity } from "../services/activity.js";
import type { AuthRequest } from "../types.js";

const router = Router();
router.use(requireAuth);

const questionSchema = z.object({
  questionText: z.string().trim().min(2).max(1000),
  questionType: z.enum(["MULTIPLE_CHOICE","TRUE_FALSE"]).default("MULTIPLE_CHOICE"),
  points: z.number().int().min(1).max(1000),
  timeLimit: z.number().int().min(5).max(600).nullable().optional(),
  explanation: z.string().max(1000).nullable().optional(),
  order: z.number().int().min(0),
  options: z.array(z.object({
    optionText: z.string().trim().min(1).max(500),
    isCorrect: z.boolean(),
    order: z.number().int().min(0)
  })).min(2).max(8)
});

const quizSchema = z.object({
  title: z.string().trim().min(2).max(160),
  description: z.string().max(2000).nullable().optional(),
  subject: z.string().trim().min(1).max(120),
  department: z.string().max(120).nullable().optional(),
  year: z.string().max(20).nullable().optional(),
  difficulty: z.enum(["EASY","MEDIUM","HARD"]).default("MEDIUM"),
  timeLimit: z.number().int().min(10).max(7200).nullable().optional(),
  resultVisibility: z.enum(["AFTER_COMPLETION","AFTER_QUIZ","ADMIN_ONLY"]).default("AFTER_COMPLETION"),
  leaderboardEnabled: z.boolean().default(true),
  questions: z.array(questionSchema).min(1).max(100)
});

function canManage(req: AuthRequest) {
  return req.auth?.role === "SUPER_ADMIN" || req.auth?.role === "STAFF";
}

function newCode() {
  return String(randomInt(100000, 1000000));
}

router.get("/", async (req: AuthRequest, res, next) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { questions: true, sessions: true } }, createdBy: { select: { fullName: true, username: true } } }
    });
    res.json({ quizzes });
  } catch (e) { next(e); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const quiz = await prisma.quiz.findUnique({ where: { id: req.params.id }, include: { questions: { orderBy: { order: "asc" }, include: { options: { orderBy: { order: "asc" } } } }, setting: true } });
    if (!quiz) throw new AppError(404, "Quiz not found.");
    res.json({ quiz });
  } catch (e) { next(e); }
});

router.post("/", requirePermission("CREATE_QUIZ"), validate(quizSchema), async (req: AuthRequest, res, next) => {
  try {
    if (!canManage(req)) throw new AppError(403, "Quiz management is restricted.");
    const created = await prisma.$transaction(async tx => {
      let joinCode = newCode();
      while (await tx.quiz.findUnique({ where: { joinCode } })) joinCode = newCode();
      const quiz = await tx.quiz.create({
        data: {
          title: req.body.title,
          description: req.body.description,
          subject: req.body.subject,
          department: req.body.department,
          year: req.body.year,
          difficulty: req.body.difficulty,
          timeLimit: req.body.timeLimit,
          resultVisibility: req.body.resultVisibility,
          leaderboardEnabled: req.body.leaderboardEnabled,
          joinCode,
          createdById: req.auth!.id,
          questions: { create: req.body.questions.map((q: any) => ({ questionText: q.questionText, questionType: q.questionType, points: q.points, timeLimit: q.timeLimit, explanation: q.explanation, order: q.order, options: { create: q.options } })) },
          setting: { create: {} }
        },
        include: { questions: { include: { options: true } } }
      });
      return quiz;
    });
    await logActivity(req, "CREATE_QUIZ", "Quiz", created.id);
    res.status(201).json({ quiz: created });
  } catch (e) { next(e); }
});

router.patch("/:id", requirePermission("EDIT_QUIZ"), validate(quizSchema.partial()), async (req: AuthRequest, res, next) => {
  try {
    const quiz = await prisma.quiz.findUnique({ where: { id: req.params.id } });
    if (!quiz) throw new AppError(404, "Quiz not found.");
    if (quiz.status === "LIVE") throw new AppError(409, "Live quizzes cannot be edited.");
    const updated = await prisma.quiz.update({ where: { id: quiz.id }, data: { title: req.body.title, description: req.body.description, subject: req.body.subject, department: req.body.department, year: req.body.year, difficulty: req.body.difficulty, timeLimit: req.body.timeLimit, resultVisibility: req.body.resultVisibility, leaderboardEnabled: req.body.leaderboardEnabled } });
    await logActivity(req, "EDIT_QUIZ", "Quiz", quiz.id);
    res.json({ quiz: updated });
  } catch (e) { next(e); }
});

router.delete("/:id", requirePermission("DELETE_QUIZ"), async (req: AuthRequest, res, next) => {
  try {
    const quiz = await prisma.quiz.findUnique({ where: { id: req.params.id } });
    if (!quiz) throw new AppError(404, "Quiz not found.");
    if (quiz.status === "LIVE") throw new AppError(409, "End the live quiz before deleting it.");
    await prisma.quiz.update({ where: { id: quiz.id }, data: { status: "ARCHIVED" } });
    await logActivity(req, "DELETE_QUIZ", "Quiz", quiz.id);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.post("/:id/publish", requirePermission("EDIT_QUIZ"), async (req: AuthRequest, res, next) => {
  try {
    const quiz = await prisma.quiz.update({ where: { id: req.params.id }, data: { status: "PUBLISHED" } });
    await logActivity(req, "PUBLISH_QUIZ", "Quiz", quiz.id);
    res.json({ quiz });
  } catch (e) { next(e); }
});

router.post("/:id/start", requirePermission("START_QUIZ"), async (req: AuthRequest, res, next) => {
  try {
    const quiz = await prisma.quiz.findUnique({ where: { id: req.params.id } });
    if (!quiz) throw new AppError(404, "Quiz not found.");
    if (quiz.status !== "PUBLISHED") throw new AppError(409, "Only published quizzes can be started.");
    const [updated] = await prisma.$transaction([
      prisma.quiz.update({ where: { id: quiz.id }, data: { status: "LIVE", startTime: new Date() } }),
      prisma.quizSession.create({ data: { quizId: quiz.id, startedAt: new Date() } })
    ]);
    await logActivity(req, "START_QUIZ", "Quiz", quiz.id);
    res.json({ quiz: updated });
  } catch (e) { next(e); }
});

router.post("/:id/end", requirePermission("END_QUIZ"), async (req: AuthRequest, res, next) => {
  try {
    const quiz = await prisma.quiz.findUnique({ where: { id: req.params.id } });
    if (!quiz) throw new AppError(404, "Quiz not found.");
    const updated = await prisma.quiz.update({ where: { id: quiz.id }, data: { status: "ENDED", endTime: new Date() } });
    await prisma.quizSession.updateMany({ where: { quizId: quiz.id, endedAt: null }, data: { endedAt: new Date() } });
    await logActivity(req, "END_QUIZ", "Quiz", quiz.id);
    res.json({ quiz: updated });
  } catch (e) { next(e); }
});

router.post("/:id/archive", requirePermission("DELETE_QUIZ"), async (req: AuthRequest, res, next) => {
  try {
    const updated = await prisma.quiz.update({ where: { id: req.params.id }, data: { status: "ARCHIVED" } });
    await logActivity(req, "ARCHIVE_QUIZ", "Quiz", updated.id);
    res.json({ quiz: updated });
  } catch (e) { next(e); }
});

export default router;
