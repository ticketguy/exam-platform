import { NextResponse } from "next/server";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";
import { dgbRpc } from "@/lib/dgb-rpc";

export async function POST() {
  try {
    await requireAdmin();

    const result = await dgbRpc.testConnection();

    if (result.success) {
      const balance = await dgbRpc.getBalance();
      return NextResponse.json({
        connected: true,
        mode: process.env.DGB_MODE || "mock",
        info: result.info,
        walletBalance: balance,
      });
    }

    return NextResponse.json(
      {
        connected: false,
        mode: process.env.DGB_MODE || "mock",
        error: result.error,
      },
      { status: 503 }
    );
  } catch (error) {
    return handleAuthError(error);
  }
}
