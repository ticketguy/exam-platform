"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FaUsers,
  FaWallet,
  FaArrowDown,
  FaArrowUp,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import OverViewCard from "@/components/ui/OverViewCard";

interface Stats {
  totalUsers: number;
  totalBalance: number;
  depositsThisMonth: number;
  withdrawalsThisMonth: number;
  pendingWithdrawals: number;
  pendingDeposits: number;
}

interface Transaction {
  id: string;
  user: string;
  type: string;
  amount: number;
  status: string;
  timestamp: string;
}

export default function AdminDashboard() {
  const [dgbMode] = useState<"mock" | "live">("mock");
  const [rpcStatus] = useState<"connected" | "disconnected">("connected");

  const [stats, setStats] = useState<Stats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);

        const [statsRes, txRes] = await Promise.all([
          fetch("/api/v1/admin/stats"),
          fetch("/api/v1/admin/transactions?limit=5"),
        ]);

        if (statsRes.ok) {
          const statsData: Stats = await statsRes.json();
          setStats(statsData);
        }

        if (txRes.ok) {
          const txData: { transactions: Transaction[]; total: number } =
            await txRes.json();
          setRecentTransactions(txData.transactions);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 w-full h-auto relative overflow-x-hidden">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-gray-600 border-t-white rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full h-auto relative overflow-x-hidden">
      {/* Date Updated and filters */}
      <div className="flex flex-row justify-between items-center w-full ">
        <p className="text-[#aaa]">
          Last Updated: <span className="text-white">Today, 10:42 AM</span>
        </p>

        <div className="flex flex-row gap-3 py-1 px-3 border rounded-3xl w-fit">
          <button>Today</button>
          <button>Week</button>
          <button>Month</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <OverViewCard
          title="Total Users"
          value={(stats?.totalUsers ?? 0).toLocaleString()}
          icon={<FaUsers />}
          bgColor="bg-blue-600"
        />

        <OverViewCard
          title="Total Balance"
          value={`${(stats?.totalBalance ?? 0).toLocaleString()} DGB`}
          icon={<FaWallet />}
          bgColor="bg-green-600"
        />

        <OverViewCard
          title="Deposits (Month)"
          value={(stats?.depositsThisMonth ?? 0).toString()}
          icon={<FaArrowDown />}
          bgColor="bg-purple-600"
        />

        <OverViewCard
          title="Withdrawals (Month)"
          value={(stats?.withdrawalsThisMonth ?? 0).toString()}
          icon={<FaArrowUp />}
          bgColor="bg-red-600"
        />
      </div>

      {/* System Status */}
      <div className="darkCard border w-full h-auto border-gray-700 rounded-lg p-6">
        <h3 className="text-white text-lg font-semibold mb-4">System Status</h3>
        <div className="flex md:items-center flex-col md:flex-row gap-6">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">DGB Mode:</span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                dgbMode === "live"
                  ? "bg-green-600 text-white"
                  : "bg-yellow-600 text-white"
              }`}
            >
              {dgbMode.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">RPC Status:</span>
            {rpcStatus === "connected" ? (
              <span className="flex items-center gap-1 text-green-400">
                <FaCheckCircle /> Connected
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-400">
                <FaExclamationCircle /> Disconnected
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="gradientCard border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-lg font-semibold">
            Recent Transactions
          </h3>
          <Link
            href="/admin/transactions"
            className="text-[#aaa] hover:underline text-sm"
          >
            View All →
          </Link>
        </div>

        {/* Mobile: Card Layout */}
        <div className="lg:hidden space-y-3">
          {recentTransactions.map((tx) => (
            <div
              key={tx.id}
              className="darkCard border border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">{tx.user}</p>
                  <p className="text-gray-400 text-xs mt-1">{tx.timestamp}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    tx.status === "confirmed"
                      ? "bg-green-600 text-white"
                      : "bg-yellow-600 text-white"
                  }`}
                >
                  {tx.status}
                </span>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white">
                <span
                  className={`inline-flex items-center gap-1 text-sm ${
                    tx.type === "deposit" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {tx.type === "deposit" ? <FaArrowDown /> : <FaArrowUp />}
                  <span className="capitalize">{tx.type}</span>
                </span>
                <span className="text-white font-mono font-semibold">
                  {tx.amount} DGB
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: Table Layout */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left text-gray-400 font-medium py-3 px-4">
                  User
                </th>
                <th className="text-left text-gray-400 font-medium py-3 px-4">
                  Type
                </th>
                <th className="text-right text-gray-400 font-medium py-3 px-4">
                  Amount
                </th>
                <th className="text-center text-gray-400 font-medium py-3 px-4">
                  Status
                </th>
                <th className="text-right text-gray-400 font-medium py-3 px-4">
                  Time
                </th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="border-b border-gray-800 hover:bg-gray-800 transition"
                >
                  <td className="py-3 px-4 text-white">{tx.user}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 ${
                        tx.type === "deposit"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {tx.type === "deposit" ? <FaArrowDown /> : <FaArrowUp />}
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-white font-mono">
                    {tx.amount} DGB
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        tx.status === "confirmed"
                          ? "bg-green-600 text-white"
                          : "bg-yellow-600 text-white"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-400 text-sm">
                    {tx.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/deposits"
          className="bg-gray-900 border darkCard rounded-lg p-6 hover:bg-gray-800 transition"
        >
          <h4 className="text-white font-semibold mb-2">Manage Deposits</h4>
          <p className="text-gray-400 text-sm">View and manage user deposits</p>
        </Link>
        <Link
          href="/admin/withdrawals"
          className="bg-gray-900 border darkCard rounded-lg p-6 hover:bg-gray-800 transition"
        >
          <h4 className="text-white font-semibold mb-2">Manage Withdrawals</h4>
          <p className="text-gray-400 text-sm">
            Approve and process withdrawals
          </p>
        </Link>
        <Link
          href="/admin/exams"
          className="bg-gray-900 border darkCard rounded-lg p-6 hover:bg-gray-800 transition"
        >
          <h4 className="text-white font-semibold mb-2">Manage Exams</h4>
          <p className="text-gray-400 text-sm">Create and manage exams</p>
        </Link>
      </div>
    </div>
  );
}
