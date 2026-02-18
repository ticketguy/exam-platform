import prisma from "./prisma";
import { dgbRpc } from "./dgb-rpc";
import type { TransactionType, TriggeredBy, Wallet } from "@prisma/client";

export async function getOrCreateWallet(userId: string): Promise<Wallet> {
  let wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) {
    const dgbAddress = await dgbRpc.getNewAddress(`user_${userId}`);
    wallet = await prisma.wallet.create({
      data: { userId, balance: 0, dgbAddress },
    });
  }
  return wallet;
}

export async function recordTransaction(params: {
  userId: string;
  type: TransactionType;
  amount: number;
  triggeredBy: TriggeredBy;
  adminId?: string;
  reason?: string;
  notes?: string;
  relatedId?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({
      where: { userId: params.userId },
    });

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore + params.amount;

    if (balanceAfter < 0) {
      throw new Error("Insufficient balance");
    }

    await tx.wallet.update({
      where: { userId: params.userId },
      data: { balance: balanceAfter },
    });

    const transaction = await tx.transaction.create({
      data: {
        userId: params.userId,
        type: params.type,
        amount: params.amount,
        balanceBefore,
        balanceAfter,
        triggeredBy: params.triggeredBy,
        adminId: params.adminId,
        reason: params.reason,
        notes: params.notes,
        relatedId: params.relatedId,
      },
    });

    return transaction;
  });
}
