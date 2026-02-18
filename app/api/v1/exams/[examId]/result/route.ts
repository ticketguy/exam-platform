import { NextResponse } from "next/server";
import { requireUser, handleAuthError } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { examId: string } }
) {
  try {
    const user = await requireUser();
    const { examId } = params;

    const attempt = await prisma.examAttempt.findFirst({
      where: {
        userId: user.id,
        examId,
        status: { in: ["completed", "invalidated"] },
      },
      orderBy: { completedAt: "desc" },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            passmark: true,
            duration: true,
            category: true,
          },
        },
      },
    });

    if (!attempt) {
      return NextResponse.json(
        { detail: "No completed attempt found" },
        { status: 404 }
      );
    }

    // Get leaderboard for this exam
    const leaderboard = await prisma.examAttempt.findMany({
      where: { examId, status: "completed" },
      orderBy: { score: "desc" },
      take: 10,
      include: {
        user: { select: { nickname: true, avatar: true } },
      },
    });

    // Calculate user's rank
    const higherScores = await prisma.examAttempt.count({
      where: {
        examId,
        status: "completed",
        score: { gt: attempt.score },
      },
    });
    const rank = higherScores + 1;

    const totalParticipants = await prisma.examAttempt.count({
      where: { examId, status: "completed" },
    });

    return NextResponse.json({
      attempt: {
        id: attempt.id,
        score: attempt.score,
        totalPoints: attempt.totalPoints,
        maxPoints: attempt.maxPoints,
        passed: attempt.passed,
        timeSpent: attempt.timeSpent,
        completedAt: attempt.completedAt,
        status: attempt.status,
      },
      exam: attempt.exam,
      rank,
      totalParticipants,
      leaderboard: leaderboard.map((entry, i) => ({
        rank: i + 1,
        nickname: entry.user.nickname,
        avatar: entry.user.avatar,
        score: entry.score,
        timeSpent: entry.timeSpent,
      })),
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
