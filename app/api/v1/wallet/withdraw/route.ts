import { NextResponse } from "next/server";
import { requireUser, handleAuthError } from "@/lib/auth-helpers";
import { withdrawSchema } from "@/lib/validation";
import { rateLimitWithdrawal } from "@/lib/rate-limit";
import { recordTransaction } from "@/lib/wallet-service";
import { dgbRpc } from "@/lib/dgb-rpc";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const user = await requireUser();

    const { allowed } = rateLimitWithdrawal(user.id);
    if (!allowed) {
      return NextResponse.json(
        { detail: "Too many withdrawal requests. Try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = withdrawSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ detail: firstError }, { status: 400 });
    }

    const { amount, destinationAddress } = parsed.data;

    // Validate DGB address
    const validation = await dgbRpc.validateAddress(destinationAddress);
    if (!validation.isvalid) {
      return NextResponse.json(
        { detail: "Invalid DigiByte address" },
        { status: 400 }
      );
    }

    const fee = 0.1; // Network fee
    const totalDeduction = amount + fee;

    // Check balance
    const wallet = await prisma.wallet.findUnique({
      where: { userId: user.id },
    });

    if (!wallet || wallet.balance < totalDeduction) {
      return NextResponse.json(
        { detail: "Insufficient balance (including network fee)" },
        { status: 400 }
      );
    }

    // Deduct from wallet
    await recordTransaction({
      userId: user.id,
      type: "withdrawal",
      amount: -totalDeduction,
      triggeredBy: "user",
      reason: `Withdrawal of ${amount} DGB to ${destinationAddress}`,
    });

    // Create withdrawal record (queued for admin approval)
    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId: user.id,
        amount,
        destinationAddress,
        fee,
        status: "queued",
      },
    });

    // Notify user
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Withdrawal Requested",
        message: `Your withdrawal of ${amount} DGB has been queued for processing.`,
      },
    });

    return NextResponse.json({
      id: withdrawal.id,
      amount: withdrawal.amount,
      fee: withdrawal.fee,
      status: withdrawal.status,
      destinationAddress: withdrawal.destinationAddress,
      message: "Withdrawal queued for processing",
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
