import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(
      100,
      Math.max(1, Number(searchParams.get("limit") || "20"))
    );
    const page = Math.max(1, Number(searchParams.get("page") || "1"));

    // Aggregate total winnings per user from exam_winnings transactions
    const topEarners = await prisma.transaction.groupBy({
      by: ["userId"],
      where: { type: "exam_winnings" },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Get user details for each
    const userIds = topEarners.map((e) => e.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, nickname: true, avatar: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    // Get exam stats for each user
    const examStats = await prisma.examAttempt.groupBy({
      by: ["userId"],
      where: { userId: { in: userIds }, status: "completed" },
      _count: true,
      _avg: { score: true },
    });

    const statsMap = new Map(examStats.map((s) => [s.userId, s]));

    const leaderboard = topEarners.map((entry, index) => {
      const user = userMap.get(entry.userId);
      const stats = statsMap.get(entry.userId);
      return {
        rank: (page - 1) * limit + index + 1,
        nickname: user?.nickname || "Unknown",
        avatar: user?.avatar || null,
        totalWinnings: entry._sum.amount || 0,
        totalExams: stats?._count || 0,
        avgScore: Math.round(stats?._avg?.score || 0),
      };
    });

    const totalUsers = await prisma.transaction.groupBy({
      by: ["userId"],
      where: { type: "exam_winnings" },
    });

    return NextResponse.json({
      leaderboard,
      totalParticipants: totalUsers.length,
      pagination: {
        page,
        limit,
        total: totalUsers.length,
        totalPages: Math.ceil(totalUsers.length / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error);
    return NextResponse.json(
      { detail: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
