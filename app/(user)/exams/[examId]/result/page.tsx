"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FaTrophy, FaWallet } from "react-icons/fa6";
import { MdOutlineAccountBalanceWallet } from "react-icons/md";

interface ResultData {
  attempt: {
    score: number;
    maxPoints: number;
    passed: boolean;
    timeSpent: number;
  };
  rank: number;
  totalParticipants: number;
  leaderboard: { nickname: string; score: number; rank: number }[];
  reward: number;
}

export default function ResultPage() {
  const { examId } = useParams<{ examId: string }>();
  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResult() {
      try {
        const res = await fetch(`/api/v1/exams/${examId}/result`);
        if (res.ok) setData(await res.json());
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    loadResult();
  }, [examId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-2 border-[#8B1E1E]/30 border-t-[#8B1E1E] rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-[#aaa]">
        <p>No result found. You may not have completed this exam yet.</p>
        <Link href="/exams" className="text-[#8B1E1E] mt-2 inline-block hover:underline">
          Back to Exams
        </Link>
      </div>
    );
  }

  const { attempt, rank, totalParticipants, leaderboard, reward } = data;
  const maxPoints = attempt.maxPoints || 100;
  const scorePercent = Math.round((attempt.score / maxPoints) * 100);
  const timeInSeconds = attempt.timeSpent || 0;
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;

  const getRankStyles = (index: number) => {
    if (index === 0) return { text: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/30" };
    if (index === 1) return { text: "text-gray-300", bg: "bg-gray-300/10 border-gray-300/30" };
    if (index === 2) return { text: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/30" };
    return { text: "text-[#aaa]", bg: "bg-[#00000030] border-[#ffffff10]" };
  };

  return (
    <div className="w-full mb-25 text-white max-w-300 mx-auto">
      <div className="md:w-[95%] lg:w-[90%] h-auto bg-linear-to-r from-[#8B1E1E] to-[#250808] border border-[#aaa] mx-auto rounded-3xl shadow-lg px-5 md:px-10 py-6">
        <div className="p-4 w-fit mx-auto rounded-lg bg-[#ffffff56] border border-[#ffffff20]">
          <FaTrophy color="gold" size={40} />
        </div>

        <div className="text-center mt-4">
          <h2 className="text-[20px] font-semibold">
            {attempt.passed ? "Congratulations!" : "Exam Completed!"}
          </h2>
          <p className="text-[#aaa] mt-2">
            {totalParticipants > 0 ? (
              <>You ranked <span className="underline text-white font-semibold">#{rank}</span> out of {totalParticipants} participants.</>
            ) : (
              "Your results are in."
            )}
          </p>
        </div>

        <div className="mt-5 w-full flex flex-col md:flex-row items-center justify-center gap-4">
          <div className="w-full md:w-[50%] flex flex-row items-center gap-4">
            <div className="text-[#aaa] w-full p-4 text-center rounded-lg bg-[#ffffff10] border border-[#ffffff20]">
              <p className="uppercase text-[12px]">Final Score</p>
              <p className="text-white font-semibold text-[20px]">
                {scorePercent}<span className="text-[#aaa] text-[14px]">%</span>
              </p>
            </div>
            <div className="text-[#aaa] w-full p-4 text-center rounded-lg bg-[#ffffff10] border border-[#ffffff20]">
              <p className="uppercase text-[12px]">Completion</p>
              <p className="text-white font-semibold text-[20px]">
                {minutes}<span className="text-[#aaa] text-[14px]">m</span> {seconds}<span className="text-[#aaa] text-[14px]">s</span>
              </p>
            </div>
          </div>
          <div className="text-[#aaa] w-full md:w-1/2 p-4 text-center h-fit rounded-lg bg-[#ffffff10] border border-[#ffffff20]">
            <p className="uppercase text-[12px] flex flex-row gap-2 items-center justify-center">
              <span><FaWallet /></span> Prize Reward
            </p>
            <p className="text-white font-semibold text-[20px] flex items-center justify-center">
              DGB {(reward || 0).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-5">
          <Link
            href="/dashboard"
            className="bg-[#00000020] py-3 px-4 text-white font-semibold rounded-2xl flex flex-row items-center justify-center gap-2 mx-auto border border-[#aaa] cursor-pointer"
          >
            <span><MdOutlineAccountBalanceWallet /></span> Back To Dashboard
          </Link>
        </div>
      </div>

      {leaderboard && leaderboard.length > 0 && (
        <div className="md:w-[95%] lg:w-[90%] mt-8 mx-auto bg-[#ffffff10] border border-[#ffffff20] rounded-3xl shadow-lg px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <FaTrophy color="gold" size={20} />
            <h3 className="text-[18px] font-semibold">Exam Leaderboard</h3>
          </div>
          <p className="text-[#aaa] text-sm mb-4">Results</p>
          <div className="flex flex-col gap-3">
            {leaderboard.map((entry, index) => {
              const styles = getRankStyles(index);
              return (
                <div key={index} className={`flex items-center justify-between rounded-xl px-4 py-3 border ${styles.bg}`}>
                  <div className="flex items-center gap-4">
                    <span className={`font-semibold ${styles.text}`}>#{entry.rank}</span>
                    <span className="font-medium">{entry.nickname}</span>
                  </div>
                  <span className="font-mono text-sm text-[#aaa]">{entry.score} pts</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}