import { NextResponse } from "next/server";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { examId: string } }
) {
  try {
    await requireAdmin();
    const { examId } = params;

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: {
        id: true,
        title: true,
        passmark: true,
        duration: true,
        _count: { select: { questions: true } },
      },
    });

    if (!exam) {
      return NextResponse.json({ detail: "Exam not found" }, { status: 404 });
    }

    const results = await prisma.examAttempt.findMany({
      where: { examId },
      orderBy: { score: "desc" },
      include: {
        user: {
          select: { id: true, name: true, email: true, nickname: true },
        },
      },
    });

    return NextResponse.json({
      exam: { ...exam, totalQuestions: exam._count.questions },
      results: results.map((r) => ({
        id: r.id,
        userId: r.user.id,
        userName: r.user.name,
        userEmail: r.user.email,
        userNickname: r.user.nickname,
        score: r.score,
        totalPoints: r.totalPoints,
        maxPoints: r.maxPoints,
        passed: r.passed,
        timeSpent: Math.round(r.timeSpent / 60),
        completedAt: r.completedAt,
        status: r.status,
      })),
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
