import { NextResponse } from "next/server";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";
import { recordTransaction } from "@/lib/wallet-service";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();
    const { id } = params;

    const body = await req.json();
    const { action, amount } = body as {
      action: "credit" | "reverse";
      amount?: number;
    };

    const deposit = await prisma.deposit.findUnique({ where: { id } });
    if (!deposit) {
      return NextResponse.json(
        { detail: "Deposit not found" },
        { status: 404 }
      );
    }

    if (action === "credit") {
      const creditAmount = amount || deposit.amount;

      await recordTransaction({
        userId: deposit.userId,
        type: "deposit",
        amount: creditAmount,
        triggeredBy: "admin",
        adminId: admin.id,
        relatedId: deposit.id,
        reason: `Manual credit for deposit ${deposit.id}`,
      });

      await prisma.deposit.update({
        where: { id },
        data: {
          status: "confirmed",
          creditedAmount: creditAmount,
          confirmedAt: new Date(),
        },
      });

      return NextResponse.json({ message: "Deposit credited" });
    }

    if (action === "reverse") {
      if (deposit.status !== "confirmed") {
        return NextResponse.json(
          { detail: "Can only reverse confirmed deposits" },
          { status: 400 }
        );
      }

      await recordTransaction({
        userId: deposit.userId,
        type: "adjustment",
        amount: -deposit.creditedAmount,
        triggeredBy: "admin",
        adminId: admin.id,
        relatedId: deposit.id,
        reason: `Reversed deposit ${deposit.id}`,
      });

      await prisma.deposit.update({
        where: { id },
        data: { status: "failed", creditedAmount: 0 },
      });

      return NextResponse.json({ message: "Deposit reversed" });
    }

    return NextResponse.json({ detail: "Invalid action" }, { status: 400 });
  } catch (error) {
    return handleAuthError(error);
  }
}
