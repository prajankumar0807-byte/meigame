import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { AppError } from "../utils/errors.js";
import { calculateResult } from "../services/results.js";

const router = Router();

router.get("/session/:sessionId", async (req, res, next) => {
  try {
    const participant = await prisma.participant.findUnique({
      where: { id: req.params.sessionId },
      include: { quiz: { include: { questions: { orderBy: { order: "asc" }, select: { id: true, questionText: true, questionType: true, points: true, timeLimit: true, order: true, options: { orderBy: { order: "asc" }, select: { id: true, optionText: true, order: true } } } } } }, answers: { select: { questionId: true, selectedOptionId: true, isCorrect: true, pointsEarned: true } } }
    });
    if (!participant) throw new AppError(404, "Participant session not found.");
    if (!["LIVE", "ENDED"].includes(participant.quiz.status)) throw new AppError(409, "This quiz is not active.");
    res.json({
      participant: { id: participant.id, name: participant.name, completedAt: participant.completedAt },
      quiz: { id: participant.quiz.id, title: participant.quiz.title, status: participant.quiz.status, timeLimit: participant.quiz.timeLimit, leaderboardEnabled: participant.quiz.leaderboardEnabled, questions: participant.quiz.questions },
      answers: participant.answers
    });
  } catch (e) { next(e); }
});

router.post("/session/:sessionId/answer", async (req, res, next) => {
  try {
    const { questionId, selectedOptionId, responseTime } = z.object({
      questionId: z.string().min(1),
      selectedOptionId: z.string().min(1),
      responseTime: z.number().int().min(0).max(3600)
    }).parse(req.body);

    const participant = await prisma.participant.findUnique({ where: { id: req.params.sessionId } });
    if (!participant || participant.completedAt) throw new AppError(404, "Active participant session not found.");
    const existing = await prisma.answer.findUnique({ where: { participantId_questionId: { participantId: participant.id, questionId } } });
    if (existing) throw new AppError(409, "An answer for this question has already been submitted.");

    const question = await prisma.question.findFirst({ where: { id: questionId, quizId: participant.quizId }, include: { options: true } });
    if (!question) throw new AppError(404, "Question not found.");
    const option = question.options.find(o => o.id === selectedOptionId);
    if (!option) throw new AppError(400, "Invalid answer option.");

    const isCorrect = option.isCorrect;
    const pointsEarned = isCorrect ? question.points : 0;
    const answer = await prisma.answer.create({ data: { participantId: participant.id, questionId, selectedOptionId, isCorrect, pointsEarned, responseTime } });
    res.status(201).json({ answer: { questionId: answer.questionId, selectedOptionId: answer.selectedOptionId, isCorrect: answer.isCorrect, pointsEarned: answer.pointsEarned } });
  } catch (e) { next(e); }
});

router.post("/session/:sessionId/complete", async (req, res, next) => {
  try {
    const participant = await prisma.participant.findUnique({ where: { id: req.params.sessionId } });
    if (!participant) throw new AppError(404, "Participant session not found.");
    if (!participant.completedAt) await prisma.participant.update({ where: { id: participant.id }, data: { completedAt: new Date() } });
    const result = await calculateResult(participant.id);
    res.json({ result });
  } catch (e) { next(e); }
});

router.get("/session/:sessionId/result", async (req, res, next) => {
  try {
    const result = await prisma.quizResult.findUnique({ where: { participantId: req.params.sessionId } });
    if (!result) throw new AppError(404, "Result is not available yet.");
    const quiz = await prisma.quiz.findUnique({ where: { id: result.quizId }, select: { leaderboardEnabled: true, title: true, resultVisibility: true } });
    if (!quiz) throw new AppError(404, "Quiz not found.");
    res.json({ result, quiz });
  } catch (e) { next(e); }
});

export default router;
