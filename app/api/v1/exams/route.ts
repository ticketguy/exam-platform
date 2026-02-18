import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const exams = await prisma.exam.findMany({
      where: { published: true },
      include: {
        _count: { select: { questions: true, examAttempts: true } },
      },
      orderBy: { publishedAt: "desc" },
    });

    const result = exams.map((exam) => ({
      id: exam.id,
      title: exam.title,
      description: exam.description,
      category: exam.category,
      difficulty: exam.difficulty,
      duration: exam.duration,
      passmark: exam.passmark,
      entryFee: exam.entryFee,
      prizePool: exam.prizePool,
      published: exam.published,
      publishedAt: exam.publishedAt,
      totalQuestions: exam._count.questions,
      totalAttempts: exam._count.examAttempts,
      createdAt: exam.createdAt,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch exams:", error);
    return NextResponse.json(
      { detail: "Failed to fetch exams" },
      { status: 500 }
    );
  }
}
