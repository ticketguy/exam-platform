"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CiTimer } from "react-icons/ci";
import { MdLockOutline } from "react-icons/md";
import { FaArrowRight } from "react-icons/fa";

export default function StartPage() {
  const { examId } = useParams<{ examId: string }>();
  const router = useRouter();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  const handleStart = async () => {
    setStarting(true);
    setError("");

    try {
      const res = await fetch(`/api/v1/exams/${examId}/start`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || "Failed to start exam");
        setStarting(false);
        return;
      }

      router.push(`/exams/${examId}/live-exam`);
    } catch {
      setError("Something went wrong. Please try again.");
      setStarting(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center bg-black text-white px-0">
      <div className="w-full max-w-xl bg-[#ffffff10] border border-[#ffffff20] rounded-3xl shadow-xl p-6 md:p-8 text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-[#8B1E1E20] flex items-center justify-center mb-4">
          <CiTimer size={28} className="text-[#8B1E1E]" />
        </div>

        <h1 className="text-2xl font-bold">Ready to Start Your Exam?</h1>

        <p className="text-[#aaa] mt-2">
          You are about to begin this exam. The entry fee will be deducted from your wallet.
        </p>

        {error && (
          <div className="mt-4 bg-red-500/15 border border-red-500/20 rounded-xl px-4 py-2.5">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="mt-5 bg-[#8B1E1E15] border border-[#8B1E1E40] rounded-2xl p-4 text-left">
          <p className="font-semibold mb-2 flex items-center gap-2">
            <MdLockOutline />
            Important Instructions
          </p>
          <ul className="text-sm text-[#aaa] list-disc list-inside space-y-1">
            <li>The exam is timed and starts immediately</li>
            <li>Do not refresh or leave this page</li>
            <li>Leaving the exam will result in disqualification</li>
            <li>Your answers are auto-saved</li>
          </ul>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleStart}
            disabled={starting}
            className="w-full flex items-center justify-center gap-2 bg-[#8B1E1E] hover:bg-[#7a1a1a] transition px-6 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {starting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Starting...
              </span>
            ) : (
              <>
                Start Exam <FaArrowRight />
              </>
            )}
          </button>

          <Link
            href={`/exams/${examId}`}
            className="w-full text-center py-3 rounded-xl border border-[#ffffff30] text-[#aaa] hover:text-white hover:border-white transition"
          >
            Go Back
          </Link>
        </div>
      </div>
    </div>
  );
}