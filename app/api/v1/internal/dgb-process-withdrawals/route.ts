import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { dgbRpc } from "@/lib/dgb-rpc";

const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET || "dev-secret";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${INTERNAL_SECRET}`) {
      return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }

    // Get all pending withdrawals ready to be sent
    const pendingWithdrawals = await prisma.withdrawal.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "asc" },
      take: 10, // process in batches
    });

    let sentCount = 0;
    let failedCount = 0;
    const results: { id: string; status: string; txid?: string; error?: string }[] = [];

    for (const withdrawal of pendingWithdrawals) {
      try {
        const txid = await dgbRpc.sendToAddress(
          withdrawal.destinationAddress,
          withdrawal.amount
        );

        await prisma.withdrawal.update({
          where: { id: withdrawal.id },
          data: {
            status: "sent",
            txid,
            sentAt: new Date(),
          },
        });

        // Notify user
        await prisma.notification.create({
          data: {
            userId: withdrawal.userId,
            title: "Withdrawal Sent",
            message: `Your withdrawal of ${withdrawal.amount} DGB has been sent. TXID: ${txid}`,
          },
        });

        sentCount++;
        results.push({ id: withdrawal.id, status: "sent", txid });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Send failed";

        await prisma.withdrawal.update({
          where: { id: withdrawal.id },
          data: {
            status: "failed",
            failureReason: errorMsg,
          },
        });

        // Refund the user's balance
        const wallet = await prisma.wallet.findUnique({
          where: { userId: withdrawal.userId },
        });

        if (wallet) {
          const balanceBefore = wallet.balance;
          const refundAmount = withdrawal.amount + withdrawal.fee;
          await prisma.wallet.update({
            where: { userId: withdrawal.userId },
            data: { balance: balanceBefore + refundAmount },
          });

          await prisma.transaction.create({
            data: {
              userId: withdrawal.userId,
              type: "adjustment",
              amount: refundAmount,
              balanceBefore,
              balanceAfter: balanceBefore + refundAmount,
              triggeredBy: "system",
              relatedId: withdrawal.id,
              reason: `Withdrawal failed: ${errorMsg}`,
            },
          });
        }

        // Notify user
        await prisma.notification.create({
          data: {
            userId: withdrawal.userId,
            title: "Withdrawal Failed",
            message: `Your withdrawal of ${withdrawal.amount} DGB failed. The amount has been refunded to your wallet.`,
          },
        });

        failedCount++;
        results.push({ id: withdrawal.id, status: "failed", error: errorMsg });
      }
    }

    return NextResponse.json({
      message: "Withdrawal processing complete",
      processed: pendingWithdrawals.length,
      sent: sentCount,
      failed: failedCount,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : "Processing failed" },
      { status: 500 }
    );
  }
}
