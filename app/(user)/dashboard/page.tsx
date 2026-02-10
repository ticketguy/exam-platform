"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FaNairaSign,
  FaChartLine,
  FaBullseye,
  FaArrowRight,
  FaMoneyBills,
} from "react-icons/fa6";
import {
  FaWallet,
  FaRegClock,
  FaPlusCircle,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { HiOutlineBolt } from "react-icons/hi2";
import { GiOpenBook } from "react-icons/gi";

type Tab = "leaderboard" | "activity" | "upcoming" | "active";

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState<Tab>("active");
  const [balanceVisible, setBalanceVisible] = useState(true);

  // Mock data — replace with API calls
  const walletBalance = "12,500.00";
  const totalExams = 24;
  const winRate = 73;
  const avgScore = 82;
  const streak = 8;

  const tabs: { key: Tab; label: string }[] = [
    { key: "active", label: "My Active" },
    { key: "upcoming", label: "Upcoming" },
    { key: "leaderboard", label: "Arena Board" },
    { key: "activity", label: "Recent Activity" },
  ];

  const activeExams = [
    {
      id: "math-sprint",
      title: "Math Olympiad Finals",
      timeLeft: "00:45:20",
      status: "In Progress",
    },
  ];

  const upcomingExams = [
    {
      id: "physics-101",
      title: "Physics Challenge",
      startsAt: "Tomorrow, 10:00 AM",
      fee: 50,
      prize: 5000,
    },
    {
      id: "english-lit",
      title: "English Literature Sprint",
      startsAt: "Feb 12, 2:00 PM",
      fee: 30,
      prize: 3000,
    },
  ];

  const leaderboard = [
    { rank: 1, name: "AceBrain", score: 980 },
    { rank: 2, name: "QuantumKid", score: 945 },
    { rank: 3, name: "NovaMind", score: 920 },
    { rank: 4, name: "SwiftSolver", score: 890 },
    { rank: 5, name: "You", score: 850, isUser: true },
  ];

  const recentActivity = [
    { type: "winnings", label: "Math Sprint Prize", amount: "+₦5,000", time: "2 hours ago" },
    { type: "fee", label: "Exam Entry Fee", amount: "-₦50", time: "3 hours ago" },
    { type: "deposit", label: "Wallet Deposit", amount: "+₦10,000", time: "Yesterday" },
    { type: "withdrawal", label: "Bank Withdrawal", amount: "-₦3,000", time: "2 days ago" },
  ];

  return (
    <div className="mt-4 space-y-5">
      {/* Two big cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Wallet Card — keeps gradient in both themes */}
        <div className="relative bg-gradient-to-br from-[#8B1E1E] to-[#250808] rounded-2xl p-5 border border-[#ffffff15] overflow-hidden themed-card">
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_30%_20%,white_1px,transparent_1px)] bg-[length:20px_20px]" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-gray-300 text-sm">
                <FaWallet size={14} />
                <span>Wallet Balance</span>
              </div>
              <button
                onClick={() => setBalanceVisible(!balanceVisible)}
                className="text-gray-400 hover:text-white transition p-1"
              >
                {balanceVisible ? <FaEye size={14} /> : <FaEyeSlash size={14} />}
              </button>
            </div>
            <div className="flex items-baseline gap-1 mb-6">
              <FaNairaSign size={24} className="text-white" />
              <span className="text-3xl font-bold text-white">
                {balanceVisible ? walletBalance : "••••••"}
              </span>
            </div>
            <div className="flex gap-3">
              <Link
                href="/wallet"
                className="flex items-center gap-2 bg-white text-[#8B1E1E] text-sm font-semibold py-2 px-4 rounded-xl hover:bg-gray-100 transition"
              >
                <FaPlusCircle size={12} />
                Deposit
              </Link>
              <Link
                href="/wallet"
                className="flex items-center gap-2 bg-[#ffffff15] text-white text-sm font-medium py-2 px-4 rounded-xl border border-[#ffffff20] hover:bg-[#ffffff20] transition"
              >
                <FaMoneyBills size={12} />
                Withdraw
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-[var(--card-bg)] rounded-2xl p-5 border border-[var(--card-border)] themed-card">
          <div className="flex items-center gap-2 mb-4">
            <HiOutlineBolt size={20} className="text-orange-400" />
            <span className="font-semibold text-[var(--text-primary)]">Your Stats</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[var(--surface)] rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-[var(--muted)] text-xs mb-1">
                <GiOpenBook size={12} />
                <span>Exams</span>
              </div>
              <span className="text-xl font-bold text-[var(--text-primary)]">{totalExams}</span>
            </div>
            <div className="bg-[var(--surface)] rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-[var(--muted)] text-xs mb-1">
                <HiOutlineBolt size={12} className="text-green-400" />
                <span>Streak</span>
              </div>
              <span className="text-xl font-bold text-green-400">{streak}</span>
            </div>
            <div className="bg-[var(--surface)] rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-[var(--muted)] text-xs mb-1">
                <FaBullseye size={12} className="text-blue-400" />
                <span>Win Rate</span>
              </div>
              <span className="text-xl font-bold text-[var(--text-primary)]">{winRate}%</span>
            </div>
            <div className="bg-[var(--surface)] rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-[var(--muted)] text-xs mb-1">
                <FaChartLine size={12} className="text-purple-400" />
                <span>Avg Score</span>
              </div>
              <span className="text-xl font-bold text-[var(--text-primary)]">{avgScore}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Island Tab Bar */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-1 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-full p-1 themed-card">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-[#8B1E1E] text-white shadow-lg shadow-[#8B1E1E]/20"
                  : "text-[var(--muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[200px]">
        {activeTab === "active" && (
          <div className="space-y-3">
            {activeExams.length > 0 ? (
              activeExams.map((exam) => (
                <div
                  key={exam.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 gap-4 themed-card"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-xl bg-[#FEF2F2]">
                      <FaRegClock size={18} color="#8B1E1E" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--text-primary)]">
                        {exam.title}
                        <span className="ml-3 inline-block px-3 py-0.5 bg-green-600/15 text-green-600 text-xs rounded-full font-medium">
                          {exam.status}
                        </span>
                      </h3>
                      <p className="text-sm text-[var(--muted)] mt-0.5">
                        Time remaining to complete all questions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="flex items-center gap-2 text-[#8B1E1E] font-mono font-bold text-lg">
                      <FaRegClock size={16} />
                      {exam.timeLeft}
                    </div>
                    <Link
                      href={`/exams/${exam.id}/live-exam`}
                      className="flex items-center gap-2 bg-[#8B1E1E] text-white text-sm font-semibold py-2 px-4 rounded-xl hover:bg-[#7a1a1a] transition"
                    >
                      Enter Exam
                      <FaArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-[var(--muted)]">
                <GiOpenBook size={40} className="mx-auto mb-3 opacity-30" />
                <p>No active exams in your arena</p>
                <Link href="/exams" className="text-[#8B1E1E] text-sm mt-1 inline-block hover:underline">
                  Enter the Exam Arena
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === "upcoming" && (
          <div className="space-y-3">
            {upcomingExams.map((exam) => (
              <div
                key={exam.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 gap-3 themed-card"
              >
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)]">{exam.title}</h3>
                  <p className="text-sm text-[var(--muted)] mt-0.5">{exam.startsAt}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-xs text-[var(--muted)]">
                    <span className="text-[var(--text-primary)] font-mono">₦{exam.fee}</span> entry
                  </div>
                  <div className="text-xs text-[var(--muted)]">
                    <span className="text-green-600 font-mono">₦{exam.prize.toLocaleString()}</span> prize
                  </div>
                  <Link href={`/exams/${exam.id}`} className="text-sm text-[#8B1E1E] hover:text-[var(--text-primary)] transition font-medium">
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "leaderboard" && (
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl overflow-hidden themed-card">
            {leaderboard.map((entry, i) => (
              <div
                key={entry.rank}
                className={`flex items-center justify-between px-4 py-3 ${
                  i !== leaderboard.length - 1 ? "border-b border-[var(--divider)]" : ""
                } ${entry.isUser ? "bg-[#8B1E1E]/10" : ""}`}
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`w-7 text-center font-bold text-sm ${
                      entry.rank === 1
                        ? "text-yellow-500"
                        : entry.rank === 2
                        ? "text-[var(--muted)]"
                        : entry.rank === 3
                        ? "text-amber-600"
                        : "text-[var(--muted)]"
                    }`}
                  >
                    #{entry.rank}
                  </span>
                  <span className={`font-medium ${entry.isUser ? "text-[#8B1E1E]" : "text-[var(--text-primary)]"}`}>
                    {entry.name}
                    {entry.isUser && <span className="text-xs text-[var(--muted)] ml-2">(You)</span>}
                  </span>
                </div>
                <span className="font-mono text-sm text-[var(--text-secondary)]">{entry.score}</span>
              </div>
            ))}
            <Link
              href="/leaderboard"
              className="flex items-center justify-center gap-2 py-3 text-sm text-[var(--muted)] hover:text-[var(--text-primary)] transition border-t border-[var(--divider)]"
            >
              View Full Arena Board
              <FaArrowRight size={10} />
            </Link>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="space-y-2">
            {recentActivity.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl px-4 py-3 themed-card"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{item.label}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">{item.time}</p>
                </div>
                <span className={`font-mono text-sm font-semibold ${item.amount.startsWith("+") ? "text-green-600" : "text-red-500"}`}>
                  {item.amount}
                </span>
              </div>
            ))}
            <Link
              href="/wallet"
              className="flex items-center justify-center gap-2 py-3 text-sm text-[var(--muted)] hover:text-[var(--text-primary)] transition"
            >
              View All Transactions
              <FaArrowRight size={10} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
