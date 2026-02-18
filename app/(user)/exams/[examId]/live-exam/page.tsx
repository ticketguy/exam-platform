"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface Question {
  id: string;
  questionText: string;
  options: string[];
  points: number;
}

export default function TakeExamPage() {
  const router = useRouter();
  const { examId } = useParams<{ examId: string }>();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [examDuration, setExamDuration] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadExam() {
      try {
        const res = await fetch(`/api/v1/exams/${examId}`);
        if (!res.ok) {
          setError("Failed to load exam data");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setQuestions(data.questions || []);
        const durationSec = (data.duration || 4) * 60;
        setExamDuration(durationSec);
        setTimeLeft(durationSec);
      } catch {
        setError("Failed to load exam");
      } finally {
        setLoading(false);
      }
    }
    loadExam();
  }, [examId]);

  /* ---------------- FINISH EXAM ---------------- */
  const finishExam = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/v1/exams/${examId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          timeSpent: examDuration - timeLeft,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || "Failed to submit exam");
        setSubmitting(false);
        return;
      }

      router.push(`/exams/${examId}/result`);
    } catch {
      setError("Failed to submit. Please try again.");
      setSubmitting(false);
    }
  };

  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    if (loading || timeLeft <= 0) {
      if (!loading && timeLeft <= 0 && questions.length > 0) finishExam();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-white">
        <div className="w-8 h-8 border-2 border-[#8B1E1E]/30 border-t-[#8B1E1E] rounded-full animate-spin" />
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <div className="text-center py-20 text-red-400">
        <p>{error}</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-20 text-[#aaa]">
        <p>No questions available for this exam.</p>
      </div>
    );
  }

  const totalQuestions = questions.length;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const completedCount = Object.keys(answers).length;
  const progressPercent = Math.round((completedCount / totalQuestions) * 100);

  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === totalQuestions - 1;

  const handleSelect = (optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [question.id]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (!isLastQuestion) setCurrentQuestion((q) => q + 1);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) setCurrentQuestion((q) => q - 1);
  };

  return (
    <div className="text-white max-w-3xl mx-auto px-4 pb-10">
      {/* TIMER */}
      <div className="flex justify-center mb-4">
        <div className={`px-6 py-2 rounded-full font-semibold ${timeLeft < 60 ? "bg-red-600 animate-pulse" : "bg-[#8B1E1E]"}`}>
          {minutes}:{seconds.toString().padStart(2, "0")}
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-500/15 border border-red-500/20 rounded-xl px-4 py-2.5">
          <p className="text-red-400 text-sm text-center">{error}</p>
        </div>
      )}

      {/* PROGRESS */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-[#aaa] mb-2">
          <span>Question {currentQuestion + 1}/{totalQuestions}</span>
          <span>{progressPercent}% completed</span>
        </div>
        <div className="w-full h-2 bg-[#ffffff20] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#8B1E1E]"
            style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* QUESTION */}
      <div className="bg-[#ffffff10] border border-[#ffffff20] rounded-2xl p-5">
        <h2 className="text-lg font-semibold mb-5">{question.questionText}</h2>
        <div className="flex flex-col gap-3">
          {(question.options as string[]).map((option, index) => {
            const selected = answers[question.id] === index;
            const letter = String.fromCharCode(65 + index);
            return (
              <button
                type="button"
                key={index}
                onClick={() => handleSelect(index)}
                className={`flex items-center gap-3 border rounded-xl px-4 py-3 text-left ${
                  selected
                    ? "bg-[#8B1E1E] border-[#8B1E1E]"
                    : "border-[#ffffff20] hover:bg-[#ffffff10]"
                }`}
              >
                <span className="font-bold">{letter}.</span>
                <span>{option}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex justify-between items-center mt-6">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className={`px-4 py-2 rounded-lg font-medium ${
            currentQuestion === 0
              ? "bg-gray-600 opacity-50 cursor-not-allowed"
              : "bg-[#ffffff20] hover:bg-[#ffffff30]"
          }`}
        >
          Previous
        </button>
        <button
          type="button"
          onClick={isLastQuestion ? finishExam : handleNext}
          disabled={submitting}
          className="px-6 py-2 rounded-lg bg-[#8B1E1E] font-semibold hover:bg-[#7a1a1a] disabled:opacity-50"
        >
          {submitting ? "Submitting..." : isLastQuestion ? "Complete Exam" : "Save & Next"}
        </button>
      </div>
    </div>
  );
}