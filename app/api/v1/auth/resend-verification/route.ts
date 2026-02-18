import { NextResponse } from "next/server";
import crypto from "crypto";
import { requireUser, handleAuthError } from "@/lib/auth-helpers";
import { sendVerificationEmail } from "@/lib/email";
import { rateLimitEmailResend } from "@/lib/rate-limit";
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    const user = await requireUser();

    if (user.emailVerified) {
      return NextResponse.json(
        { detail: "Email is already verified" },
        { status: 400 }
      );
    }

    const { allowed } = rateLimitEmailResend(user.id);
    if (!allowed) {
      return NextResponse.json(
        { detail: "Please wait before requesting another verification email." },
        { status: 429 }
      );
    }

    const token = crypto.randomUUID();
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerificationToken: token },
    });

    await sendVerificationEmail(user.email, token);

    return NextResponse.json({
      message: "Verification email sent. Check your inbox.",
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
