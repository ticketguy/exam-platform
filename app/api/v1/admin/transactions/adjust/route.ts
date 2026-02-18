import { NextResponse } from "next/server";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";
import { adjustBalanceSchema } from "@/lib/validation";
import { recordTransaction } from "@/lib/wallet-service";

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();

    const body = await req.json();
    const parsed = adjustBalanceSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ detail: firstError }, { status: 400 });
    }

    const { userId, amount, reason, notes } = parsed.data;

    const transaction = await recordTransaction({
      userId,
      type: "adjustment",
      amount,
      triggeredBy: "admin",
      adminId: admin.id,
      reason,
      notes,
    });

    return NextResponse.json({
      message: "Balance adjusted",
      transaction,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
