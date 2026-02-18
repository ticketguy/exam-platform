"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BiTimer, BiWallet } from "react-icons/bi";
import { FaArrowLeft, FaArrowRight, FaRegCheckCircle, FaTrophy } from "react-icons/fa";

interface Exam {
  id: string;
  title: string;
  category: string;
  entryFee: number;
  prizePool: number;
  duration: number;
  published: boolean;
  _count?: { questions: number };
}

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadExams() {
      try {
        const res = await fetch("/api/v1/exams");
        if (res.ok) {
          const data = await res.json();
          setExams(Array.isArray(data) ? data : []);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    loadExams();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-2 border-[#8B1E1E]/30 border-t-[#8B1E1E] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="text-white mb-40">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--text-primary)] transition mb-4"
      >
        <FaArrowLeft size={12} />
        Back to Dashboard
      </Link>

      <h1 className="text-[40px] font-semibold">Exam Arena</h1>
      <p className="text-[#aaa]">
        Select an exam below to compete for prizes.
      </p>

      {exams.length === 0 ? (
        <div className="mt-10 text-center text-[#aaa]">
          <p className="text-lg">No exams available at the moment.</p>
          <p className="text-sm mt-2">Check back soon for new challenges!</p>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="rounded-3xl shadow-md overflow-hidden w-full border bg-[#8B1E1E]"
            >
              {/* Image placeholder */}
              <div className="relative w-full h-37 bg-gradient-to-br from-[#250808] to-[#8B1E1E] flex items-center justify-center">
                <span className="text-4xl font-bold text-white/20">{exam.category}</span>

                <span className="absolute top-4 left-2 text-white text-xs font-semibold px-2 py-1 rounded-lg uppercase flex items-center gap-2 bg-green-400">
                  <FaRegCheckCircle />
                  Available
                </span>

                <div className="flex flex-col gap-1 absolute bottom-3 left-2 backdrop-blur-[2px] backdrop-brightness-90 p-3 rounded-md">
                  <h2 className="font-semibold text-lg text-white">{exam.title}</h2>
                  <span className="flex items-center gap-2 text-white text-sm">
                    <BiTimer size={14} />
                    {exam.duration} minutes
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 flex flex-col gap-2 text-white bg-[#8B1E1E]">
                <div className="flex justify-between mt-2">
                  <div>
                    <p className="text-[#aaa] text-[12px] uppercase">Prize Pool</p>
                    <p className="font-bold">DGB {exam.prizePool.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[#aaa] text-[12px] uppercase">Entry Fee</p>
                    <p className="font-bold">DGB {exam.entryFee}</p>
                  </div>
                </div>

                <hr className="my-3 border-gray-300" />

                <div className="flex items-center gap-2 text-[#aaa]">
                  <FaTrophy color="yellow" />
                  <p className="text-[13px]">
                    {exam._count?.questions || 0} questions &middot; Top scorers share the pool
                  </p>
                </div>

                <Link href={`/exams/${exam.id}`}>
                  <button type="button" className="mt-4 w-full py-2 bg-white text-[#8B1E1E] font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-[#ffffff10] hover:text-white hover:border hover:border-[#ffffff10] transition">
                    View Details <FaArrowRight />
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}