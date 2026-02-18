import { NextResponse } from "next/server";
import crypto from "crypto";
import { createUser, userToPublic } from "@/lib/users";
import { getOrCreateWallet } from "@/lib/wallet-service";
import { sendVerificationEmail } from "@/lib/email";
import { registerSchema } from "@/lib/validation";
import { rateLimitRegister } from "@/lib/rate-limit";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const { allowed } = rateLimitRegister(ip);
    if (!allowed) {
      return NextResponse.json(
        { detail: "Too many registration attempts. Try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ detail: firstError }, { status: 400 });
    }

    const { name, nickname, email, password } = parsed.data;

    const result = await createUser({ name, nickname, email, password });

    if ("error" in result) {
      return NextResponse.json({ detail: result.error }, { status: 409 });
    }

    // Create wallet for the new user
    await getOrCreateWallet(result.id);

    // Generate email verification token
    const token = crypto.randomUUID();
    await prisma.user.update({
      where: { id: result.id },
      data: { emailVerificationToken: token },
    });

    // Send verification email (non-blocking)
    sendVerificationEmail(email, token).catch((err) => {
      console.error("Failed to send verification email:", err);
    });

    return NextResponse.json({
      ...userToPublic(result),
      message: "Account created. Please check your email to verify your account.",
    });
  } catch {
    return NextResponse.json(
      { detail: "Invalid request" },
      { status: 400 }
    );
  }
}
