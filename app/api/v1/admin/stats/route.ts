import { NextResponse } from "next/server";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      totalBalance,
      depositsThisMonth,
      withdrawalsThisMonth,
      pendingWithdrawals,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "user" } }),
      prisma.wallet.aggregate({ _sum: { balance: true } }),
      prisma.deposit.count({
        where: { createdAt: { gte: startOfMonth }, status: "confirmed" },
      }),
      prisma.withdrawal.count({
        where: { createdAt: { gte: startOfMonth }, status: "sent" },
      }),
      prisma.withdrawal.count({ where: { status: { in: ["queued", "pending"] } } }),
    ]);

    return NextResponse.json({
      totalUsers,
      totalBalance: totalBalance._sum.balance || 0,
      depositsThisMonth,
      withdrawalsThisMonth,
      pendingWithdrawals,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
