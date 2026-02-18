import { NextResponse } from "next/server";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { examId: string; resultId: string } }
) {
  try {
    await requireAdmin();
    const { resultId } = params;

    const body = await req.json();
    const { action } = body as { action: "invalidate" | "reset" };

    const attempt = await prisma.examAttempt.findUnique({
      where: { id: resultId },
    });

    if (!attempt) {
      return NextResponse.json(
        { detail: "Result not found" },
        { status: 404 }
      );
    }

    if (action === "invalidate") {
      await prisma.examAttempt.update({
        where: { id: resultId },
        data: { status: "invalidated" },
      });
      return NextResponse.json({ message: "Result invalidated" });
    }

    if (action === "reset") {
      await prisma.examAttempt.deleteMany({
        where: { userId: attempt.userId, examId: attempt.examId },
      });
      return NextResponse.json({ message: "All attempts reset for this user" });
    }

    return NextResponse.json({ detail: "Invalid action" }, { status: 400 });
  } catch (error) {
    return handleAuthError(error);
  }
}
