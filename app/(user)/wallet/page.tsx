"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { CiCircleInfo } from "react-icons/ci";
import {
  FaChevronLeft,
  FaChevronRight,
  FaCopy,
  FaPlusCircle,
} from "react-icons/fa";
import { FaArrowRight, FaMoneyBills } from "react-icons/fa6";

interface WalletData {
  balance: number;
  dgbAddress: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  reason: string;
  createdAt: string;
}

export default function Walletpage() {
  const historyTab = [
    { key: "all", label: "All" },
    { key: "deposit", label: "Deposits" },
    { key: "withdrawal", label: "Withdrawals" },
    { key: "exam_fee", label: "Fees" },
    { key: "exam_winnings", label: "Winnings" },
  ] as const;

  const [activeTab, setActiveTab] = useState("all");
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 10;

  useEffect(() => {
    async function load() {
      try {
        const [walletRes, txRes] = await Promise.all([
          fetch("/api/v1/wallet"),
          fetch(`/api/v1/wallet/transactions?limit=${perPage}&offset=${(page - 1) * perPage}${activeTab !== "all" ? `&type=${activeTab}` : ""}`),
        ]);
        if (walletRes.ok) setWallet(await walletRes.json());
        if (txRes.ok) {
          const data = await txRes.json();
          setTransactions(data.transactions || []);
          setTotal(data.total || 0);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [page, activeTab]);

  const handleCopy = () => {
    if (wallet?.dgbAddress) {
      navigator.clipboard.writeText(wallet.dgbAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-2 border-[#8B1E1E]/30 border-t-[#8B1E1E] rounded-full animate-spin" />
      </div>
    );
  }

  const balance = wallet?.balance || 0;

  return (
    <div className="text-white mb-40 overflow-x-hidden">
      <h1 className="text-[30px]">Overview</h1>

      <div>
        <div className="mt-5 flex flex-col md:flex-row gap-5">
          {/* Left side */}
          <div className="w-full md:w-[60%] flex flex-col gap-5">
            {/* Wallet Balance */}
            <div className="border border-[#aaa] md:w-full relative md:h-auto flex flex-col md:flex-row items-start justify-between bg-linear-to-r from-[#8B1E1E] to-[#250808] rounded-3xl p-5">
              <div>
                <p className="uppercase text-[14px]">Total Wallet balance</p>
                <div className="flex flex-row items-center gap-1 font-bold text-white mt-2">
                  <h1 className="text-[40px]">
                    DGB {balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </h1>
                </div>
              </div>
              <div className="flex w-fit self-end">
                <button type="button" className="flex flex-row gap-1 font-semibold items-center bg-white p-2 rounded-lg cursor-pointer text-[#8B1E1E]">
                  <FaMoneyBills />
                  Withdraw Funds
                </button>
              </div>
            </div>

            {/* Transaction History */}
            <div className="w-full h-full bg-[#ffffff10] border border-[#ffffff20] rounded-3xl shadow-lg">
              <div className="p-4 w-full flex flex-row items-center justify-between flex-wrap gap-5">
                <h2 className="text-white font-semibold">Transaction History</h2>
                <div className="flex gap-2 bg-[#61616141] rounded-xl p-1 self-baseline">
                  {historyTab.map((tab) => (
                    <button
                      type="button"
                      className={`p-1 rounded-lg cursor-pointer text-[12px] ${tab.key === activeTab ? "bg-white text-black" : ""}`}
                      key={tab.key}
                      onClick={() => { setActiveTab(tab.key); setPage(1); }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-4 sm:px-6 pb-4 sm:pb-6 flex flex-col">
                <div className="flex-1 overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#61616141]">
                        <th className="text-left py-3 text-[#aaa] font-medium text-[14px]">Date</th>
                        <th className="text-left py-3 text-[#aaa] font-medium text-[14px]">Description</th>
                        <th className="text-left py-3 text-[#aaa] font-medium text-[14px] hidden md:table-cell">Type</th>
                        <th className="text-left py-3 text-[#aaa] font-medium text-[14px]">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.length > 0 ? transactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-[#61616141]">
                          <td className="py-4 text-[12px]">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-4 text-[14px]">
                            {tx.reason || tx.type.replace(/_/g, " ")}
                          </td>
                          <td className="py-4 text-[14px] capitalize hidden md:table-cell">
                            {tx.type.replace(/_/g, " ")}
                          </td>
                          <td className={`py-4 text-[14px] font-semibold ${tx.amount >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {tx.amount >= 0 ? "+" : ""}{tx.amount.toLocaleString()} DGB
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-[#aaa]">
                            No transactions yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 flex flex-row items-center justify-between">
                  <p className="text-[14px] text-[#aaa]">
                    Showing {transactions.length} of {total} entries
                  </p>
                  <div className="flex flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="p-2 bg-[#61616141] rounded-lg cursor-pointer hover:bg-[#616161] transition disabled:opacity-30"
                    >
                      <FaChevronLeft size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page * perPage >= total}
                      className="p-2 bg-[#61616141] rounded-lg cursor-pointer hover:bg-[#616161] transition disabled:opacity-30"
                    >
                      <FaChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="w-full md:w-[35%] flex-1 flex justify-between flex-col">
            <div className="bg-[#ffffff10] border border-[#ffffff20] rounded-3xl shadow-lg w-full p-5">
              <div className="flex flex-row gap-2 items-center">
                <FaPlusCircle color="#8B1E1E" />
                <h3 className="text-[18px] font-semibold">Deposit Funds</h3>
              </div>

              <div className="mt-3 w-full">
                <p className="uppercase text-[14px]">Digibyte Deposit address</p>
                <div className="mt-1 relative border py-1 px-2 w-full overflow-hidden rounded-full">
                  <p className="pr-10 text-sm break-all">
                    {wallet?.dgbAddress || "No address generated yet"}
                  </p>
                  <div
                    onClick={handleCopy}
                    className="absolute right-0 px-2 bg-white top-0 w-fit h-full flex items-center justify-center cursor-pointer"
                  >
                    <FaCopy color="black" />
                  </div>
                </div>
                {copied && <p className="text-xs text-green-400 mt-1">Copied!</p>}
              </div>

              <div className="mt-3 rounded-lg text-[#8B1E1E] bg-[#FFF7ED] p-3 flex flex-row gap-2 items-start">
                <div className="font-bold">
                  <CiCircleInfo size={20} className="font-bold" />
                </div>
                <p className="text-[14px]">
                  Send only <span className="font-semibold">Digibyte (DGB)</span> to this
                  address. Your balance will update automatically after{" "}
                  <span className="font-semibold">6 network confirmations.</span>
                </p>
              </div>
            </div>

            <div className="bg-linear-to-r from-[#8B1E1E] to-[#250808] rounded-3xl p-5 mt-5 border border-[#aaa] h-full flex flex-col justify-center">
              <h3 className="font-semibold text-[20px]">Win Big In Exams!</h3>
              <p className="mt-2">
                Top scorers share the prize pool. Enter an exam and compete!
              </p>
              <Link
                href="/exams"
                className="mt-2 py-1 px-3 bg-[#ffffff70] rounded-lg flex flex-row gap-2 items-center w-fit hover:bg-white hover:text-black transition"
              >
                Go To Exams <span><FaArrowRight /></span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}