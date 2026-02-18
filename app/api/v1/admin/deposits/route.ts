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
        { txid: { contains: search, mode: "insensitive" } },
      ];
    }

    const [deposits, total] = await Promise.all([
      prisma.deposit.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.deposit.count({ where }),
    ]);

    return NextResponse.json({
      deposits: deposits.map((d) => ({
        id: d.id,
        userId: d.user.id,
        userName: d.user.name,
        userEmail: d.user.email,
        amount: d.amount,
        txid: d.txid,
        status: d.status,
        confirmations: d.confirmations,
        depositAddress: d.depositAddress,
        creditedAmount: d.creditedAmount,
        createdAt: d.createdAt,
        confirmedAt: d.confirmedAt,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
