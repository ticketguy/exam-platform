import { NextResponse } from "next/server";
import { requireAdmin, handleAuthError } from "@/lib/auth-helpers";
import { updateExamSchema } from "@/lib/validation";
import prisma from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { examId: string } }
) {
  try {
    await requireAdmin();
    const { examId } = params;

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: { orderBy: { orderIndex: "asc" } },
        _count: { select: { examAttempts: true } },
      },
    });

    if (!exam) {
      return NextResponse.json({ detail: "Exam not found" }, { status: 404 });
    }

    return NextResponse.json(exam);
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { examId: string } }
) {
  try {
    await requireAdmin();
    const { examId } = params;

    const body = await req.json();
    const parsed = updateExamSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ detail: firstError }, { status: 400 });
    }

    const { questions, published, ...examData } = parsed.data;

    // Update exam fields
    const updateData: Record<string, unknown> = { ...examData };
    if (published !== undefined) {
      updateData.published = published;
      if (published) {
        const existing = await prisma.exam.findUnique({
          where: { id: examId },
        });
        if (existing && !existing.publishedAt) {
          updateData.publishedAt = new Date();
        }
      }
    }

    const exam = await prisma.exam.update({
      where: { id: examId },
      data: updateData,
    });

    // Update questions if provided
    if (questions) {
      // Delete existing questions and recreate
      await prisma.question.deleteMany({ where: { examId } });
      await prisma.question.createMany({
        data: questions.map((q, index) => ({
          examId,
          questionText: q.questionText,
          options: JSON.stringify(q.options),
          correctAnswer: q.correctAnswer,
          points: q.points,
          orderIndex: index,
        })),
      });
    }

    const updated = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: { orderBy: { orderIndex: "asc" } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { examId: string } }
) {
  try {
    await requireAdmin();
    const { examId } = params;

    await prisma.exam.delete({ where: { id: examId } });

    return NextResponse.json({ message: "Exam deleted" });
  } catch (error) {
    return handleAuthError(error);
  }
}
