import { NextResponse } from "next/server";
import { requireUser, handleAuthError } from "@/lib/auth-helpers";
import { submitAnswersSchema } from "@/lib/validation";
import { recordTransaction } from "@/lib/wallet-service";
import prisma from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { examId: string } }
) {
  try {
    const user = await requireUser();
    const { examId } = params;

    const body = await req.json();
    const parsed = submitAnswersSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { detail: "Invalid answers format" },
        { status: 400 }
      );
    }

    const { answers } = parsed.data;

    // Find the in-progress attempt
    const attempt = await prisma.examAttempt.findFirst({
      where: { userId: user.id, examId, status: "in_progress" },
    });

    if (!attempt) {
      return NextResponse.json(
        { detail: "No active exam attempt found" },
        { status: 404 }
      );
    }

    // Check time limit
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { questions: true },
    });

    if (!exam) {
      return NextResponse.json({ detail: "Exam not found" }, { status: 404 });
    }

    const elapsed = Math.floor(
      (Date.now() - attempt.startedAt.getTime()) / 1000
    );
    const timeLimit = exam.duration * 60 + 30; // 30 second grace period

    if (elapsed > timeLimit) {
      // Auto-complete with current answers but flag as time exceeded
      await prisma.examAttempt.update({
        where: { id: attempt.id },
        data: {
          status: "completed",
          completedAt: new Date(),
          timeSpent: elapsed,
          score: 0,
          passed: false,
          answers: answers as Record<string, number>,
        },
      });

      return NextResponse.json(
        { detail: "Time limit exceeded" },
        { status: 400 }
      );
    }

    // Grade the exam
    let totalPoints = 0;
    let correctAnswers = 0;
    const maxPoints = exam.questions.reduce((sum, q) => sum + q.points, 0);

    for (const question of exam.questions) {
      const userAnswer = answers[question.id];
      if (userAnswer !== undefined && userAnswer === question.correctAnswer) {
        totalPoints += question.points;
        correctAnswers++;
      }
    }

    const score =
      maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
    const passed = score >= exam.passmark;

    // Update the attempt
    await prisma.examAttempt.update({
      where: { id: attempt.id },
      data: {
        status: "completed",
        completedAt: new Date(),
        timeSpent: elapsed,
        score,
        totalPoints,
        maxPoints,
        passed,
        answers: answers as Record<string, number>,
      },
    });

    // Credit winnings if passed (simplified: top scorer gets proportional share)
    if (passed && exam.prizePool > 0) {
      const completedAttempts = await prisma.examAttempt.count({
        where: { examId, status: "completed", passed: true },
      });

      // Simple prize distribution: divide pool among all passers
      if (completedAttempts > 0) {
        const share = Math.floor(
          (exam.prizePool / (completedAttempts + 1)) * 100
        ) / 100;

        if (share > 0) {
          await recordTransaction({
            userId: user.id,
            type: "exam_winnings",
            amount: share,
            triggeredBy: "system",
            relatedId: examId,
            reason: `Winnings from ${exam.title}`,
          });
        }
      }
    }

    // Create notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: passed ? "Exam Passed!" : "Exam Completed",
        message: `You scored ${score}% on ${exam.title}. ${
          passed ? "Congratulations!" : "Better luck next time!"
        }`,
      },
    });

    return NextResponse.json({
      attemptId: attempt.id,
      score,
      totalPoints,
      maxPoints,
      passed,
      correctAnswers,
      totalQuestions: exam.questions.length,
      timeSpent: elapsed,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
