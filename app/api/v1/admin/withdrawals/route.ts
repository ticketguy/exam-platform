import { NextResponse } from "next/server";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.min(50, Number(searchParams.get("limit") || "20"));

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { destinationAddress: { contains: search, mode: "insensitive" } },
      ];
    }

    const [withdrawals, total] = await Promise.all([
      prisma.withdrawal.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.withdrawal.count({ where }),
    ]);

    return NextResponse.json({
      withdrawals: withdrawals.map((w) => ({
        id: w.id,
        userId: w.user.id,
        userName: w.user.name,
        userEmail: w.user.email,
        amount: w.amount,
        destinationAddress: w.destinationAddress,
        txid: w.txid,
        status: w.status,
        fee: w.fee,
        confirmations: w.confirmations,
        failureReason: w.failureReason,
        blockReason: w.blockReason,
        createdAt: w.createdAt,
        sentAt: w.sentAt,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
