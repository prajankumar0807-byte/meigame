import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { AppError } from "../utils/errors.js";

const router = Router();

router.post("/:joinCode", async (req, res, next) => {
  try {
    const code = z.string().regex(/^\d{6}$/).parse(req.params.joinCode);
    const { name, collegeId } = z.object({
      name: z.string().trim().min(2).max(100),
      collegeId: z.string().trim().max(80).optional()
    }).parse(req.body);

    const quiz = await prisma.quiz.findUnique({
      where: { joinCode: code },
      include: {
        questions: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            questionText: true,
            questionType: true,
            points: true,
            timeLimit: true,
            order: true,
            options: {
              orderBy: { order: "asc" },
              select: { id: true, optionText: true, order: true }
            }
          }
        }
      }
    });

    if (!quiz || !["PUBLISHED", "LIVE"].includes(quiz.status)) {
      throw new AppError(404, "Invalid or unavailable quiz code.");
    }
    if (quiz.status === "ENDED" || quiz.status === "ARCHIVED") {
      throw new AppError(410, "This quiz has ended.");
    }

    const session = await prisma.quizSession.findFirst({
      where: { quizId: quiz.id, endedAt: null },
      orderBy: { createdAt: "desc" }
    });
    if (!session) throw new AppError(409, "The quiz is not currently running.");

    const participant = await prisma.participant.create({
      data: { quizId: quiz.id, sessionId: session.id, name, collegeId }
    });

    res.status(201).json({
      participant: { id: participant.id, sessionId: participant.sessionId, name: participant.name },
      quiz: {
        id: quiz.id,
        title: quiz.title,
        subject: quiz.subject,
        timeLimit: quiz.timeLimit,
        leaderboardEnabled: quiz.leaderboardEnabled,
        questions: quiz.questions
      }
    });
  } catch (e) {
    next(e);
  }
});

export default router;
