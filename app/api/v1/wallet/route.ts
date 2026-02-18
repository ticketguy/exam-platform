import { NextResponse } from "next/server";
import { requireUser, handleAuthError } from "@/lib/auth-helpers";
import { getOrCreateWallet } from "@/lib/wallet-service";

export async function GET() {
  try {
    const user = await requireUser();
    const wallet = await getOrCreateWallet(user.id);

    return NextResponse.json({
      id: wallet.id,
      balance: wallet.balance,
      dgbAddress: wallet.dgbAddress,
      createdAt: wallet.createdAt,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
