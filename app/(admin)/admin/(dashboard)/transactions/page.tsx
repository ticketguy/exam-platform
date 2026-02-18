"use client";

import OverViewCard from "@/components/ui/OverViewCard";
import { useState, useEffect, useCallback } from "react";
import {
  FaSearch,
  FaFilter,
  FaArrowDown,
  FaArrowUp,
  FaExchangeAlt,
  FaDownload,
  FaUserShield,
  FaRobot,
  FaUser,
} from "react-icons/fa";

type TransactionType = "deposit" | "withdrawal" | "adjustment" | "exam_fee";
type TriggeredBy = "system" | "user" | "admin";

interface Transaction {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  triggeredBy: TriggeredBy;
  adminName?: string | null;
  reason?: string | null;
  notes?: string | null;
  relatedId?: string | null;
  createdAt: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | TransactionType>("all");
  const [filterTriggeredBy, setFilterTriggeredBy] = useState<
    "all" | TriggeredBy
  >("all");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterType !== "all") params.set("type", filterType);
      if (filterTriggeredBy !== "all") params.set("triggeredBy", filterTriggeredBy);
      if (searchTerm) params.set("search", searchTerm);
      params.set("limit", "50");

      const res = await fetch(`/api/v1/admin/transactions?${params}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  }, [filterType, filterTriggeredBy, searchTerm]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Calculate stats
  const totalTransactions = transactions.length;
  const totalCredits = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalDebits = transactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const netChange = totalCredits - totalDebits;

  // Get transaction type display info
  const getTypeInfo = (type: TransactionType) => {
    switch (type) {
      case "deposit":
        return { label: "Deposit", color: "text-green-400", icon: <FaArrowDown /> };
      case "withdrawal":
        return { label: "Withdrawal", color: "text-red-400", icon: <FaArrowUp /> };
      case "adjustment":
        return { label: "Adjustment", color: "text-blue-400", icon: <FaExchangeAlt /> };
      case "exam_fee":
        return { label: "Exam Fee", color: "text-purple-400", icon: <FaExchangeAlt /> };
      default:
        return { label: type, color: "text-gray-400", icon: <FaExchangeAlt /> };
    }
  };

  const getTriggeredByIcon = (triggeredBy: TriggeredBy) => {
    switch (triggeredBy) {
      case "system":
        return <FaRobot className="text-blue-400" />;
      case "admin":
        return <FaUserShield className="text-yellow-400" />;
      case "user":
        return <FaUser className="text-green-400" />;
      default:
        return <FaRobot />;
    }
  };

  const handleExportCSV = () => {
    const csvHeaders = [
      "ID", "Type", "User", "Email", "Amount", "Balance Before",
      "Balance After", "Triggered By", "Admin", "Reason", "Date",
    ];
    const csvData = transactions.map((t) => [
      t.id, t.type, t.userName, t.userEmail, t.amount, t.balanceBefore,
      t.balanceAfter, t.triggeredBy, t.adminName || "", t.reason || "",
      new Date(t.createdAt).toLocaleString(),
    ]);

    const csv = [
      csvHeaders.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${new Date().toISOString()}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-gray-600 border-t-white rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Transaction Ledger</h1>
          <p className="text-gray-400 text-sm mt-1">
            Complete audit log of all financial transactions
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition w-fit"
        >
          <FaDownload /> Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <OverViewCard title="Total Transactions" value={`${totalTransactions}`} />
        <OverViewCard
          title="Total Credits"
          value={`+${totalCredits.toFixed(2)} DGB`}
          valueColor="text-green-400"
        />
        <OverViewCard
          title="Total Debits"
          value={`-${totalDebits.toFixed(2)} DGB`}
          valueColor="text-red-400"
        />
        <OverViewCard
          title="Net Change"
          value={`${netChange >= 0 ? "+" : ""}${netChange.toFixed(2)} DGB`}
          valueColor={netChange >= 0 ? "text-green-400" : "text-red-400"}
        />
      </div>

      {/* Filters */}
      <div className="darkCard p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-gray-400 text-sm mb-2 block">
              <FaSearch className="inline mr-2" />
              Search
            </label>
            <input
              type="text"
              placeholder="Search by user, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full fadeInput rounded-lg px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-2 block">
              <FaFilter className="inline mr-2" />
              Transaction Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as typeof filterType)}
              className="w-full fadeInput rounded-lg px-3 py-2 text-white"
            >
              <option value="all">All Types</option>
              <option value="deposit">Deposits</option>
              <option value="withdrawal">Withdrawals</option>
              <option value="adjustment">Adjustments</option>
              <option value="exam_fee">Exam Fees</option>
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-2 block">
              Triggered By
            </label>
            <select
              value={filterTriggeredBy}
              onChange={(e) => setFilterTriggeredBy(e.target.value as typeof filterTriggeredBy)}
              className="w-full fadeInput rounded-lg px-3 py-2 text-white"
            >
              <option value="all">All</option>
              <option value="system">System</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List - Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {transactions.length === 0 ? (
          <div className="redCard p-8 text-center">
            <p className="text-gray-400">No transactions found</p>
          </div>
        ) : (
          transactions.map((transaction) => {
            const typeInfo = getTypeInfo(transaction.type);
            return (
              <div
                key={transaction.id}
                className="redCard p-4 cursor-pointer hover:bg-gray-800 transition"
                onClick={() => setSelectedTransaction(transaction)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-semibold">{transaction.userName}</h3>
                    <p className="text-gray-400 text-xs">{transaction.userEmail}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTriggeredByIcon(transaction.triggeredBy)}
                    <span className={`text-sm ${typeInfo.color}`}>{typeInfo.icon}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs">Type</p>
                    <p className={`font-medium ${typeInfo.color}`}>{typeInfo.label}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Amount</p>
                    <p className={`font-bold ${transaction.amount >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {transaction.amount >= 0 ? "+" : ""}{transaction.amount} DGB
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Balance After</p>
                    <p className="text-white font-mono">{transaction.balanceAfter} DGB</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Date</p>
                    <p className="text-white text-xs">{new Date(transaction.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                {transaction.reason && (
                  <div className="pt-2 border-t border-gray-700">
                    <p className="text-gray-400 text-xs">Reason: {transaction.reason}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Transactions List - Desktop Table */}
      <div className="hidden lg:block redCard overflow-hidden">
        {transactions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400">No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="darkCard">
                <tr>
                  <th className="text-left text-gray-400 font-medium py-3 px-4">User</th>
                  <th className="text-left text-gray-400 font-medium py-3 px-4">Type</th>
                  <th className="text-right text-gray-400 font-medium py-3 px-4">Amount</th>
                  <th className="text-right text-gray-400 font-medium py-3 px-4">Balance Before</th>
                  <th className="text-right text-gray-400 font-medium py-3 px-4">Balance After</th>
                  <th className="text-center text-gray-400 font-medium py-3 px-4">Triggered By</th>
                  <th className="text-left text-gray-400 font-medium py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => {
                  const typeInfo = getTypeInfo(transaction.type);
                  return (
                    <tr
                      key={transaction.id}
                      className="border-t border-gray-800 hover:bg-gray-800 transition cursor-pointer"
                      onClick={() => setSelectedTransaction(transaction)}
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-white font-medium">{transaction.userName}</p>
                          <p className="text-gray-400 text-xs">{transaction.userEmail}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 ${typeInfo.color}`}>
                          {typeInfo.icon}
                          <span>{typeInfo.label}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-mono font-bold ${transaction.amount >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {transaction.amount >= 0 ? "+" : ""}{transaction.amount} DGB
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-300 font-mono">
                        {transaction.balanceBefore} DGB
                      </td>
                      <td className="py-3 px-4 text-right text-white font-mono font-semibold">
                        {transaction.balanceAfter} DGB
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {getTriggeredByIcon(transaction.triggeredBy)}
                          <span className="text-gray-300 text-sm capitalize">{transaction.triggeredBy}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-300 text-sm">
                        {new Date(transaction.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="darkCard p-6 max-w-2xl w-full max-h-[95vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-white text-xl font-bold">Transaction Details</h2>
                <p className="text-gray-400 text-sm font-mono">{selectedTransaction.id}</p>
              </div>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <p className="text-gray-400 text-sm">Transaction Amount</p>
              <div className="flex items-center justify-between mt-1">
                <p className={`text-3xl font-bold ${selectedTransaction.amount >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {selectedTransaction.amount >= 0 ? "+" : ""}{selectedTransaction.amount} DGB
                </p>
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${getTypeInfo(selectedTransaction.type).color}`}>
                  {getTypeInfo(selectedTransaction.type).label}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-gray-400 text-sm mb-1">User</p>
                <p className="text-white font-medium">{selectedTransaction.userName}</p>
                <p className="text-gray-400 text-xs">{selectedTransaction.userEmail}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Triggered By</p>
                <div className="flex items-center gap-2">
                  {getTriggeredByIcon(selectedTransaction.triggeredBy)}
                  <span className="text-white capitalize">{selectedTransaction.triggeredBy}</span>
                </div>
                {selectedTransaction.adminName && (
                  <p className="text-gray-400 text-xs mt-1">Admin: {selectedTransaction.adminName}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-gray-400 text-sm">Before</p>
                <p className="text-white font-mono">{selectedTransaction.balanceBefore} DGB</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">After</p>
                <p className="text-white font-mono font-bold">{selectedTransaction.balanceAfter} DGB</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Date</p>
                <p className="text-white text-sm">{new Date(selectedTransaction.createdAt).toLocaleString()}</p>
              </div>
            </div>

            {(selectedTransaction.relatedId || selectedTransaction.reason) && (
              <div className="space-y-4 mb-6">
                {selectedTransaction.relatedId && (
                  <div>
                    <p className="text-gray-400 text-sm">Related ID</p>
                    <p className="text-white font-mono">{selectedTransaction.relatedId}</p>
                  </div>
                )}
                {selectedTransaction.reason && (
                  <div>
                    <p className="text-gray-400 text-sm">Reason</p>
                    <p className="text-white">{selectedTransaction.reason}</p>
                  </div>
                )}
              </div>
            )}

            {selectedTransaction.notes && (
              <div className="mb-6">
                <p className="text-gray-400 text-sm mb-1">Notes</p>
                <div className="bg-gray-800 p-3 rounded text-white">{selectedTransaction.notes}</div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedTransaction(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}