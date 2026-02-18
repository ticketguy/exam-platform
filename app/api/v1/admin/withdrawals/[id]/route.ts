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
    const { action, reason } = body as {
      action: "approve" | "deny" | "retry" | "block" | "unblock";
      reason?: string;
    };

    const withdrawal = await prisma.withdrawal.findUnique({ where: { id } });
    if (!withdrawal) {
      return NextResponse.json(
        { detail: "Withdrawal not found" },
        { status: 404 }
      );
    }

    switch (action) {
      case "approve": {
        if (withdrawal.status !== "queued") {
          return NextResponse.json(
            { detail: "Can only approve queued withdrawals" },
            { status: 400 }
          );
        }
        await prisma.withdrawal.update({
          where: { id },
          data: { status: "pending" },
        });
        return NextResponse.json({ message: "Withdrawal approved" });
      }

      case "deny": {
        if (!["queued", "pending"].includes(withdrawal.status)) {
          return NextResponse.json(
            { detail: "Cannot deny this withdrawal" },
            { status: 400 }
          );
        }
        // Refund the amount
        await recordTransaction({
          userId: withdrawal.userId,
          type: "adjustment",
          amount: withdrawal.amount + withdrawal.fee,
          triggeredBy: "admin",
          adminId: admin.id,
          relatedId: id,
          reason: `Withdrawal denied: ${reason || "Admin decision"}`,
        });

        await prisma.withdrawal.update({
          where: { id },
          data: {
            status: "failed",
            failureReason: reason || "Denied by admin",
          },
        });
        return NextResponse.json({ message: "Withdrawal denied and refunded" });
      }

      case "retry": {
        if (withdrawal.status !== "failed") {
          return NextResponse.json(
            { detail: "Can only retry failed withdrawals" },
            { status: 400 }
          );
        }
        await prisma.withdrawal.update({
          where: { id },
          data: { status: "pending", failureReason: null },
        });
        return NextResponse.json({ message: "Withdrawal queued for retry" });
      }

      case "block": {
        await prisma.withdrawal.updateMany({
          where: { userId: withdrawal.userId, status: { in: ["queued", "pending"] } },
          data: { status: "blocked", blockReason: reason || "Blocked by admin" },
        });
        return NextResponse.json({
          message: "User's withdrawals blocked",
        });
      }

      case "unblock": {
        await prisma.withdrawal.updateMany({
          where: { userId: withdrawal.userId, status: "blocked" },
          data: { status: "queued", blockReason: null },
        });
        return NextResponse.json({
          message: "User's withdrawals unblocked",
        });
      }

      default:
        return NextResponse.json(
          { detail: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    return handleAuthError(error);
  }
}
