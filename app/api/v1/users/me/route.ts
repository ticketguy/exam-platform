import { NextResponse } from "next/server";
import { requireUser, handleAuthError } from "@/lib/auth-helpers";
import { userToPublic, updateUser } from "@/lib/users";
import { updateProfileSchema } from "@/lib/validation";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireUser();

    const wallet = await prisma.wallet.findUnique({
      where: { userId: user.id },
    });

    const attemptStats = await prisma.examAttempt.aggregate({
      where: { userId: user.id, status: "completed" },
      _count: true,
      _avg: { score: true },
    });

    const wins = await prisma.examAttempt.count({
      where: { userId: user.id, status: "completed", passed: true },
    });

    return NextResponse.json({
      ...userToPublic(user),
      walletBalance: wallet?.balance ?? 0,
      dgbAddress: wallet?.dgbAddress ?? null,
      stats: {
        totalExams: attemptStats._count,
        avgScore: Math.round(attemptStats._avg.score ?? 0),
        winRate:
          attemptStats._count > 0
            ? Math.round((wins / attemptStats._count) * 100)
            : 0,
        wins,
      },
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();

    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ detail: firstError }, { status: 400 });
    }

    const updated = await updateUser(user.id, parsed.data);
    if (!updated) {
      return NextResponse.json({ detail: "User not found" }, { status: 404 });
    }

    return NextResponse.json(userToPublic(updated));
  } catch (error) {
    return handleAuthError(error);
  }
}
