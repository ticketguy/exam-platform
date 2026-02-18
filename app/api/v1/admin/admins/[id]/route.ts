import { NextResponse } from "next/server";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentAdmin = await requireAdmin();
    const { id } = params;

    if (currentAdmin.id === id) {
      return NextResponse.json(
        { detail: "Cannot remove yourself" },
        { status: 400 }
      );
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target || target.role !== "admin") {
      return NextResponse.json(
        { detail: "Admin not found" },
        { status: 404 }
      );
    }

    // Downgrade to user role instead of deleting
    await prisma.user.update({
      where: { id },
      data: { role: "user" },
    });

    return NextResponse.json({ message: "Admin removed" });
  } catch (error) {
    return handleAuthError(error);
  }
}
