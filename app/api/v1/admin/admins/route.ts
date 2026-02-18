import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";
import { addAdminSchema } from "@/lib/validation";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();

    const admins = await prisma.user.findMany({
      where: { role: "admin" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(admins);
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const body = await req.json();
    const parsed = addAdminSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ detail: firstError }, { status: 400 });
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { detail: "Email already in use" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await prisma.user.create({
      data: {
        name,
        nickname: email.split("@")[0],
        email,
        passwordHash,
        role: "admin",
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleAuthError(error);
  }
}
