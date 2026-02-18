"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CgDetailsMore } from "react-icons/cg";
import { CiTimer, CiTrophy } from "react-icons/ci";
import { FaNairaSign, FaTrophy } from "react-icons/fa6";
import { IoIosRefresh } from "react-icons/io";
import { MdGavel, MdLockOutline, MdOutlinePayments } from "react-icons/md";

interface ExamDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: number;
  passmark: number;
  entryFee: number;
  prizePool: number;
  published: boolean;
  _count?: { questions: number; examAttempts: number };
}

export default function ExamPage() {
  const { examId } = useParams<{ examId: string }>();
  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [examRes, walletRes] = await Promise.all([
          fetch(`/api/v1/exams/${examId}`),
          fetch("/api/v1/wallet"),
        ]);
        if (examRes.ok) setExam(await examRes.json());
        if (walletRes.ok) {
          const w = await walletRes.json();
          setWalletBalance(w.balance || 0);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [examId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-2 border-[#8B1E1E]/30 border-t-[#8B1E1E] rounded-full animate-spin" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="text-center py-20 text-[#aaa]">
        <p className="text-lg">Exam not found.</p>
        <Link href="/exams" className="text-[#8B1E1E] mt-2 inline-block hover:underline">
          Back to Exam Arena
        </Link>
      </div>
    );
  }

  const totalPrize = exam.prizePool;
  const prizeRows = [
    {
      rank: "1st Place",
      percent: 40,
      amount: totalPrize * 0.4,
      icon: <FaTrophy className="text-yellow-400" />,
    },
    {
      rank: "2nd Place",
      percent: 20,
      amount: totalPrize * 0.2,
      icon: <FaTrophy className="text-gray-300" />,
    },
    {
      rank: "3rd Place",
      percent: 10,
      amount: totalPrize * 0.1,
      icon: <FaTrophy className="text-amber-700" />,
    },
    {
      rank: "4th - 10th",
      percent: 30,
      amount: totalPrize * 0.3,
      icon: null,
      shared: true,
    },
  ];

  return (
    <div className="text-white pb-20">
      {/* link paths */}
      <div>
        <p>
          <Link href="/exams" className="text-[#8B1E1E]">
            My Exams
          </Link>{" "}
          / {exam.title}
        </p>
      </div>

      <div className="mt-5 flex flex-row gap-2">
        <div className="bg-[#DCFCE7] border border-[#BBF7D0] text-[12px] md:text-[14px] rounded-full px-4 w-fit text-[#15803D]">
          <p>Registration Open</p>
        </div>
        <div className="bg-[#E5E7EB] border border-[#E5E7EB] text-[12px] md:text-[14px] text-[#4B5563] rounded-full px-4 w-fit flex flex-row gap-2 items-center">
          <CgDetailsMore />
          <p>{exam.category} &middot; {exam.difficulty}</p>
        </div>
      </div>

      {/* Exam info, prize pool and entry fee, with rules and instructions */}
      <div className="flex flex-col md:flex-row gap-5 mt-5">
        {/* Exam details */}
        <div className="w-full md:w-[50%]">
          <h1 className="text-2xl font-bold">{exam.title}</h1>
          <p className="mt-1 text-[#aaa]">
            {exam.description || "Test your knowledge and compete for the grand prize."}
          </p>

          {/* Total Prize Pool and Entry fee */}
          <div className="mt-4 flex flex-col md:flex-row gap-3">
            {/* Prize Pool */}
            <div className="relative w-full md:w-1/2 bg-[#ffffff10] border border-[#ffffff20] rounded-3xl shadow-lg px-6 py-6">
              <p className="uppercase text-[14px] text-[#8B1E1E]">Total prize pool</p>
              <p className="flex flex-row items-center gap-2 text-[30px] font-semibold">
                DGB {totalPrize.toLocaleString()}
              </p>
              <p className="text-[#15803D] text-[10px] mt-2">Guaranteed</p>
              <span className="absolute -right-2 top-1/2 -translate-1/2">
                <CiTrophy size={80} className="font-extrabold text-[#8b1e1e25]" />
              </span>
            </div>

            {/* Entry Fee */}
            <div className="relative w-full md:w-1/2 bg-[#ffffff10] border border-[#ffffff20] rounded-3xl shadow-lg px-6 py-6">
              <p className="uppercase text-[14px] text-[#8B1E1E]">Entry Fee</p>
              <p className="flex flex-row items-center gap-2 text-[30px] font-semibold">
                DGB {exam.entryFee}
              </p>
              <div className="flex flex-row gap-1 items-center w-fit mt-2">
                <p className="text-[#8B1E1E] bg-[#8B1E1E10] w-fit rounded-full px-2 text-[10px]">
                  Wallet Pay
                </p>
                <MdLockOutline size={12} color="#aaa" />
              </div>
              <span className="absolute -right-2 top-1/2 -translate-1/2">
                <MdOutlinePayments size={80} className="font-extrabold text-[#8b1e1e25]" />
              </span>
            </div>
          </div>
        </div>

        {/* Rules and regulations */}
        <div className="w-full md:w-[50%] bg-[#ffffff10] border border-[#ffffff20] rounded-3xl">
          <div className="py-4 px-6 bg-[#8B1E1E20] flex flex-row gap-1 items-center">
            <MdGavel size={20} />
            <h2 className="text-[18px] font-semibold">Rules and Regulations</h2>
          </div>
          <div className="p-4 flex flex-col gap-2">
            <div className="flex flex-row items-start gap-3">
              <span className="p-3 bg-[#8B1E1E] rounded-lg h-fit w-fit">
                <CiTimer size={18} />
              </span>
              <div>
                <p className="font-semibold">{exam.duration}-Minute Duration</p>
                <small className="text-[#aaa]">
                  You have exactly {exam.duration} minutes to answer {exam._count?.questions || 0} questions. Speed matters.
                </small>
              </div>
            </div>
            <div className="flex flex-row items-start gap-3">
              <span className="p-3 bg-[#8B1E1E] rounded-lg h-fit w-fit">
                <IoIosRefresh size={18} />
              </span>
              <div>
                <p className="font-semibold">No Refresh</p>
                <small className="text-[#aaa]">
                  Do not refresh or close the tab. Leaving the exam screen will result in instant disqualification.
                </small>
              </div>
            </div>
            <div className="flex flex-row items-start gap-3">
              <span className="p-3 bg-[#8B1E1E] rounded-lg h-fit w-fit">
                <CiTrophy size={18} />
              </span>
              <div>
                <p className="font-semibold">Top 10 Win</p>
                <small className="text-[#aaa]">
                  Only the top 10 highest scorers will receive prize money.
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prize Distribution */}
      <div className="bg-[#ffffff10] border border-[#ffffff20] rounded-3xl p-4 mt-5">
        <div className="w-full">
          <h3 className="text-[20px] font-semibold">Prize Distribution</h3>
          <p className="text-[#aaa]">Breakdown of Rewards by rank.</p>

          <div className="flex flex-col md:flex-row gap-5">
            <div className="mt-4 overflow-x-auto w-full md:w-[80%]">
              <div className="border border-[#ffffff20] rounded-2xl overflow-hidden">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="text-[#aaa] bg-[#8B1E1E20] border-b border-[#ffffff20]">
                      <th className="text-left py-3 px-4">Rank</th>
                      <th className="text-center py-3 px-4">Percentage</th>
                      <th className="text-right py-3 px-4">Prize Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prizeRows.map((row, index) => (
                      <tr key={index} className="border-b border-[#ffffff10] last:border-none">
                        <td className="py-3 px-4 flex items-center gap-2 font-medium">
                          {row.icon && (
                            <span className="flex items-center justify-center w-5 h-5">
                              {row.icon}
                            </span>
                          )}
                          {row.rank}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {row.percent}%{" "}
                          {row.shared && (
                            <span className="text-[#aaa] text-xs">(shared)</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold">
                          DGB {row.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <hr className="mb-4 border-gray-700 md:hidden flex" />

            {/* Enter Exam */}
            <div className="w-full md:w-[20%] flex flex-col md:items-end items-center justify-center">
              <p className="text-[#aaa] w-fit">
                Wallet Balance:{" "}
                <span className="font-semibold text-white">DGB {walletBalance.toLocaleString()}</span>
              </p>
              <Link
                href={`/exams/${examId}/start`}
                className="inline-block mt-2 bg-[#8B1E1E] text-[white] px-4 py-2 rounded-lg font-semibold shadow-md"
              >
                Enter Exam{" "}
                <span className="bg-[#ffffff30] text-[12px] px-2 rounded-lg">
                  Pay DGB {exam.entryFee}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}