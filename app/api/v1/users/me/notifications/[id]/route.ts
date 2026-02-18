import { NextResponse } from "next/server";
import { requireUser, handleAuthError } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";

export async function PATCH(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireUser();
    const { id } = params;

    const notification = await prisma.notification.findFirst({
      where: { id, userId: user.id },
    });

    if (!notification) {
      return NextResponse.json(
        { detail: "Notification not found" },
        { status: 404 }
      );
    }

    await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return NextResponse.json({ message: "Notification marked as read" });
  } catch (error) {
    return handleAuthError(error);
  }
}
