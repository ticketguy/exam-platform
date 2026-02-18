import { NextResponse } from "next/server";
import { requireUser, handleAuthError } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
import type { TransactionType } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || "20")));
    const type = searchParams.get("type") as TransactionType | null;

    const where: Record<string, unknown> = { userId: user.id };
    if (type) {
      where.type = type;
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
