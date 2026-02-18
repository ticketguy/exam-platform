import { NextResponse } from "next/server";
import { requireUser, handleAuthError } from "@/lib/auth-helpers";
import { recordTransaction } from "@/lib/wallet-service";
import prisma from "@/lib/prisma";

export async function POST(
  _req: Request,
  { params }: { params: { examId: string } }
) {
  try {
    const user = await requireUser();
    const { examId } = params;

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          orderBy: { orderIndex: "asc" },
          select: {
            id: true,
            questionText: true,
            options: true,
            points: true,
            orderIndex: true,
            // NOTE: correctAnswer is intentionally excluded
          },
        },
      },
    });

    if (!exam || !exam.published) {
      return NextResponse.json({ detail: "Exam not found" }, { status: 404 });
    }

    // Check if user already has an in-progress attempt
    const existingAttempt = await prisma.examAttempt.findFirst({
      where: { userId: user.id, examId, status: "in_progress" },
    });

    if (existingAttempt) {
      // Return existing attempt with questions
      return NextResponse.json({
        attemptId: existingAttempt.id,
        exam: {
          id: exam.id,
          title: exam.title,
          duration: exam.duration,
          passmark: exam.passmark,
        },
        questions: exam.questions,
        startedAt: existingAttempt.startedAt,
      });
    }

    // Check wallet balance for entry fee
    if (exam.entryFee > 0) {
      const wallet = await prisma.wallet.findUnique({
        where: { userId: user.id },
      });

      if (!wallet || wallet.balance < exam.entryFee) {
        return NextResponse.json(
          { detail: "Insufficient balance to enter this exam" },
          { status: 400 }
        );
      }

      // Deduct entry fee
      await recordTransaction({
        userId: user.id,
        type: "exam_fee",
        amount: -exam.entryFee,
        triggeredBy: "system",
        relatedId: examId,
        reason: `Entry fee for ${exam.title}`,
      });

      // Add to prize pool
      await prisma.exam.update({
        where: { id: examId },
        data: { prizePool: { increment: exam.entryFee } },
      });
    }

    // Calculate max points
    const maxPoints = exam.questions.reduce(
      (sum, q) => sum + q.points,
      0
    );

    // Create exam attempt
    const attempt = await prisma.examAttempt.create({
      data: {
        userId: user.id,
        examId,
        maxPoints,
        status: "in_progress",
      },
    });

    return NextResponse.json({
      attemptId: attempt.id,
      exam: {
        id: exam.id,
        title: exam.title,
        duration: exam.duration,
        passmark: exam.passmark,
      },
      questions: exam.questions,
      startedAt: attempt.startedAt,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
