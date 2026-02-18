import { NextResponse } from "next/server";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";
import { createExamSchema } from "@/lib/validation";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();

    const exams = await prisma.exam.findMany({
      include: {
        _count: { select: { questions: true, examAttempts: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = await Promise.all(
      exams.map(async (exam) => {
        const completedAttempts = await prisma.examAttempt.count({
          where: { examId: exam.id, status: "completed" },
        });
        const passedAttempts = await prisma.examAttempt.count({
          where: { examId: exam.id, status: "completed", passed: true },
        });
        const avgScore = await prisma.examAttempt.aggregate({
          where: { examId: exam.id, status: "completed" },
          _avg: { score: true },
          _max: { score: true },
          _min: { score: true },
        });

        const uniqueUsers = await prisma.examAttempt.groupBy({
          by: ["userId"],
          where: { examId: exam.id },
        });

        return {
          ...exam,
          totalQuestions: exam._count.questions,
          totalAttempts: completedAttempts,
          uniqueUsers: uniqueUsers.length,
          passRate:
            completedAttempts > 0
              ? Math.round((passedAttempts / completedAttempts) * 100)
              : 0,
          averageScore: Math.round(avgScore._avg.score ?? 0),
          highestScore: avgScore._max.score ?? 0,
          lowestScore: avgScore._min.score ?? 0,
        };
      })
    );

    return NextResponse.json(result);
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const body = await req.json();
    const parsed = createExamSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ detail: firstError }, { status: 400 });
    }

    const { questions, published, ...examData } = parsed.data;

    const exam = await prisma.exam.create({
      data: {
        ...examData,
        published,
        publishedAt: published ? new Date() : null,
        questions: {
          create: questions.map((q, index) => ({
            questionText: q.questionText,
            options: JSON.stringify(q.options),
            correctAnswer: q.correctAnswer,
            points: q.points,
            orderIndex: index,
          })),
        },
      },
      include: { questions: true },
    });

    return NextResponse.json(exam, { status: 201 });
  } catch (error) {
    return handleAuthError(error);
  }
}
