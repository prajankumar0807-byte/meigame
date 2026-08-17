import { prisma } from "../db.js";

export async function calculateResult(participantId: string) {
  const participant = await prisma.participant.findUnique({
    where: { id: participantId },
    include: { answers: true }
  });
  if (!participant) throw new Error("Participant not found.");

  const quiz = await prisma.quiz.findUnique({
    where: { id: participant.quizId },
    include: { questions: true }
  });
  if (!quiz) throw new Error("Quiz not found.");

  const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
  const score = participant.answers.reduce((sum, a) => sum + a.pointsEarned, 0);
  const correctAnswers = participant.answers.filter(a => a.isCorrect).length;
  const incorrectAnswers = participant.answers.length - correctAnswers;
  const accuracy = quiz.questions.length ? Number(((correctAnswers / quiz.questions.length) * 100).toFixed(2)) : 0;
  const timeTaken = participant.completedAt
    ? Math.max(0, Math.floor((participant.completedAt.getTime() - participant.joinedAt.getTime()) / 1000))
    : 0;

  const result = await prisma.quizResult.upsert({
    where: { participantId },
    update: { score, totalPoints, correctAnswers, incorrectAnswers, accuracy, timeTaken },
    create: {
      participantId,
      quizId: quiz.id,
      score,
      totalPoints,
      correctAnswers,
      incorrectAnswers,
      accuracy,
      timeTaken
    }
  });

  const ranked = await prisma.quizResult.findMany({
    where: { quizId: quiz.id },
    orderBy: [{ score: "desc" }, { timeTaken: "asc" }]
  });

  for (let i = 0; i < ranked.length; i++) {
    await prisma.quizResult.update({ where: { id: ranked[i].id }, data: { rank: i + 1 } });
  }

  return prisma.quizResult.findUnique({ where: { id: result.id } });
}
