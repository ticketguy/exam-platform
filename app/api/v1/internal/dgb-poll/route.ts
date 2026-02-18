import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { dgbRpc } from "@/lib/dgb-rpc";
import { recordTransaction } from "@/lib/wallet-service";

const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET || "dev-secret";
const REQUIRED_CONFIRMATIONS = 6;

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${INTERNAL_SECRET}`) {
      return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }

    // 1. Check pending deposits for confirmation updates
    const pendingDeposits = await prisma.deposit.findMany({
      where: { status: "pending" },
    });

    let updatedCount = 0;
    let creditedCount = 0;

    for (const deposit of pendingDeposits) {
      if (!deposit.txid) continue;

      try {
        const txInfo = await dgbRpc.getTransaction(deposit.txid);
        const confirmations = (txInfo.confirmations as number) || 0;

        if (confirmations >= REQUIRED_CONFIRMATIONS && deposit.creditedAmount === 0) {
          // Credit the deposit
          await recordTransaction({
            userId: deposit.userId,
            type: "deposit",
            amount: deposit.amount,
            triggeredBy: "system",
            relatedId: deposit.id,
            reason: "DGB deposit confirmed",
          });

          await prisma.deposit.update({
            where: { id: deposit.id },
            data: {
              status: "confirmed",
              confirmations,
              creditedAmount: deposit.amount,
              confirmedAt: new Date(),
            },
          });

          // Notify user
          await prisma.notification.create({
            data: {
              userId: deposit.userId,
              title: "Deposit Confirmed",
              message: `Your deposit of ${deposit.amount} DGB has been confirmed and credited to your wallet.`,
            },
          });

          creditedCount++;
        } else {
          await prisma.deposit.update({
            where: { id: deposit.id },
            data: { confirmations },
          });
        }

        updatedCount++;
      } catch {
        // Skip failed tx lookups
      }
    }

    // 2. Poll for new incoming transactions
    const recentTxs = await dgbRpc.listTransactions("*", 50);
    let newDepositsCount = 0;

    for (const tx of recentTxs) {
      if (
        tx.category !== "receive" ||
        !tx.txid ||
        !tx.address ||
        (tx.amount as number) <= 0
      ) {
        continue;
      }

      // Check if we already tracked this txid
      const existing = await prisma.deposit.findFirst({
        where: { txid: tx.txid as string },
      });
      if (existing) continue;

      // Find the wallet with this deposit address
      const wallet = await prisma.wallet.findFirst({
        where: { dgbAddress: tx.address as string },
      });
      if (!wallet) continue;

      // Create new pending deposit
      await prisma.deposit.create({
        data: {
          userId: wallet.userId,
          amount: tx.amount as number,
          txid: tx.txid as string,
          depositAddress: tx.address as string,
          confirmations: (tx.confirmations as number) || 0,
          status: "pending",
        },
      });

      newDepositsCount++;
    }

    return NextResponse.json({
      message: "DGB poll complete",
      updatedDeposits: updatedCount,
      creditedDeposits: creditedCount,
      newDeposits: newDepositsCount,
    });
  } catch (error) {
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : "Poll failed" },
      { status: 500 }
    );
  }
}
