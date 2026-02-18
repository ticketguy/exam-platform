import { NextResponse } from "next/server";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
import type { TransactionType, TriggeredBy } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") as TransactionType | null;
    const triggeredBy = searchParams.get("triggeredBy") as TriggeredBy | null;
    const search = searchParams.get("search");
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.min(50, Number(searchParams.get("limit") || "20"));

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (triggeredBy) where.triggeredBy = triggeredBy;
    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { id: { contains: search, mode: "insensitive" } },
      ];
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          admin: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return NextResponse.json({
      transactions: transactions.map((t) => ({
        id: t.id,
        userId: t.user.id,
        userName: t.user.name,
        userEmail: t.user.email,
        type: t.type,
        amount: t.amount,
        balanceBefore: t.balanceBefore,
        balanceAfter: t.balanceAfter,
        triggeredBy: t.triggeredBy,
        adminName: t.admin?.name || null,
        reason: t.reason,
        notes: t.notes,
        relatedId: t.relatedId,
        createdAt: t.createdAt,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
