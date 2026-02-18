"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FaTrophy } from "react-icons/fa6";
import { FaArrowLeft } from "react-icons/fa";

interface LeaderEntry {
  rank: number;
  nickname: string;
  totalEarnings: number;
}

export default function LeaderBoardPage() {
  const [entries, setEntries] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/v1/leaderboard?limit=50");
        if (res.ok) {
          const data = await res.json();
          setEntries(Array.isArray(data) ? data : []);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-2 border-[#8B1E1E]/30 border-t-[#8B1E1E] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full mb-25 text-white">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--text-primary)] transition mb-2 mt-4 ml-4 sm:ml-6"
      >
        <FaArrowLeft size={12} />
        Back to Dashboard
      </Link>

      <div className="md:w-[95%] lg:w-[90%] mt-8 mx-auto bg-[#ffffff10] border border-[#ffffff20] rounded-3xl shadow-lg px-6 py-6">
        <div className="flex items-center gap-3 mb-2">
          <FaTrophy color="gold" size={20} />
          <h3 className="text-[18px] font-semibold">Global Leaderboard</h3>
        </div>
        <p className="text-[#aaa] text-sm mb-4">Top earners on the platform</p>

        <div className="flex flex-col gap-3">
          {entries.length > 0 ? (
            entries.map((entry) => (
              <div
                key={entry.rank}
                className={`flex items-center justify-between rounded-xl px-4 py-3 border ${
                  entry.rank === 1
                    ? "bg-yellow-400/10 border-yellow-400/30"
                    : entry.rank === 2
                      ? "bg-gray-300/10 border-gray-300/30"
                      : entry.rank === 3
                        ? "bg-orange-400/10 border-orange-400/30"
                        : "bg-[#00000030] border-[#ffffff10]"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`font-semibold ${
                      entry.rank === 1
                        ? "text-yellow-400"
                        : entry.rank === 2
                          ? "text-gray-300"
                          : entry.rank === 3
                            ? "text-orange-400"
                            : "text-[#aaa]"
                    }`}
                  >
                    #{entry.rank}
                  </span>
                  <span className="font-medium">{entry.nickname}</span>
                </div>
                <span className="font-mono text-sm text-[#aaa]">
                  DGB {entry.totalEarnings?.toLocaleString() || 0}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-[#aaa]">
              <p>No leaderboard data yet. Be the first to earn!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}