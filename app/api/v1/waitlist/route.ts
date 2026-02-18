import { NextResponse } from "next/server";
import { waitlistSchema } from "@/lib/validation";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = waitlistSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { detail: "Valid email address is required" },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Check if already on waitlist
    const existing = await prisma.waitlistEntry.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json({
        message: "You're already on the waitlist!",
      });
    }

    await prisma.waitlistEntry.create({
      data: { email },
    });

    return NextResponse.json({
      message: "You've been added to the waitlist!",
    });
  } catch {
    return NextResponse.json(
      { detail: "Failed to join waitlist" },
      { status: 500 }
    );
  }
}
