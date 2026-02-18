import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { examId: string } }
) {
  try {
    const { examId } = params;

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        _count: { select: { questions: true, examAttempts: true } },
      },
    });

    if (!exam || !exam.published) {
      return NextResponse.json({ detail: "Exam not found" }, { status: 404 });
    }

    const completedAttempts = await prisma.examAttempt.count({
      where: { examId, status: "completed" },
    });

    const passedAttempts = await prisma.examAttempt.count({
      where: { examId, status: "completed", passed: true },
    });

    const avgScore = await prisma.examAttempt.aggregate({
      where: { examId, status: "completed" },
      _avg: { score: true },
    });

    return NextResponse.json({
      id: exam.id,
      title: exam.title,
      description: exam.description,
      category: exam.category,
      difficulty: exam.difficulty,
      duration: exam.duration,
      passmark: exam.passmark,
      entryFee: exam.entryFee,
      prizePool: exam.prizePool,
      publishedAt: exam.publishedAt,
      totalQuestions: exam._count.questions,
      totalAttempts: completedAttempts,
      passRate:
        completedAttempts > 0
          ? Math.round((passedAttempts / completedAttempts) * 100)
          : 0,
      averageScore: Math.round(avgScore._avg.score ?? 0),
    });
  } catch (error) {
    console.error("Failed to fetch exam:", error);
    return NextResponse.json(
      { detail: "Failed to fetch exam" },
      { status: 500 }
    );
  }
}
