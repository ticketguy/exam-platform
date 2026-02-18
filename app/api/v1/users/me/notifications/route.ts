import { NextResponse } from "next/server";
import { requireUser, handleAuthError } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireUser();

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: user.id, read: false },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PATCH() {
  try {
    const user = await requireUser();

    await prisma.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    });

    return NextResponse.json({ message: "All notifications marked as read" });
  } catch (error) {
    return handleAuthError(error);
  }
}
