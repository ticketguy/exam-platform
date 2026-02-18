"use client";

import OverViewCard from "@/components/ui/OverViewCard";
import { useState, useEffect, useCallback } from "react";
import {
  FaSearch,
  FaFilter,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaDownload,
  FaRedo,
  FaBan,
  FaExclamationTriangle,
} from "react-icons/fa";

interface Withdrawal {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  destinationAddress: string;
  txid: string | null;
  status: string;
  fee: number;
  confirmations: number;
  failureReason: string | null;
  blockReason: string | null;
  createdAt: string;
  sentAt: string | null;
}

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "queued" | "pending" | "sent" | "failed" | "blocked"
  >("all");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchWithdrawals = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.set("status", filterStatus);
      if (searchTerm) params.set("search", searchTerm);
      params.set("limit", "50");

      const res = await fetch(`/api/v1/admin/withdrawals?${params}`);
      if (res.ok) {
        const data = await res.json();
        setWithdrawals(data.withdrawals);
      }
    } catch (error) {
      console.error("Failed to fetch withdrawals:", error);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, searchTerm]);

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  // Calculate stats
  const totalWithdrawals = withdrawals.length;
  const queuedWithdrawals = withdrawals.filter((w) => w.status === "queued").length;
  const pendingWithdrawals = withdrawals.filter((w) => w.status === "pending").length;
  const totalAmount = withdrawals
    .filter((w) => w.status === "sent")
    .reduce((sum, w) => sum + w.amount, 0);

  const performAction = async (id: string, action: string, reason?: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/withdrawals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });
      if (res.ok) {
        fetchWithdrawals();
        return true;
      } else {
        const err = await res.json();
        alert(err.detail || `Failed to ${action}`);
        return false;
      }
    } catch {
      alert(`Failed to ${action}`);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (withdrawal: Withdrawal) => {
    if (confirm(`Approve withdrawal of ${withdrawal.amount} DGB for ${withdrawal.userName}?`)) {
      await performAction(withdrawal.id, "approve");
    }
  };

  const handleDeny = async (withdrawal: Withdrawal) => {
    if (confirm(`Deny withdrawal of ${withdrawal.amount} DGB for ${withdrawal.userName}?`)) {
      await performAction(withdrawal.id, "deny");
    }
  };

  const handleRetry = async (withdrawal: Withdrawal) => {
    if (confirm(`Retry withdrawal of ${withdrawal.amount} DGB for ${withdrawal.userName}?`)) {
      await performAction(withdrawal.id, "retry");
    }
  };

  const handleBlockUser = async () => {
    if (!selectedWithdrawal || !blockReason.trim()) {
      alert("Please enter a reason for blocking");
      return;
    }
    const ok = await performAction(selectedWithdrawal.id, "block", blockReason);
    if (ok) {
      setShowBlockModal(false);
      setBlockReason("");
      setSelectedWithdrawal(null);
    }
  };

  const handleUnblock = async (withdrawal: Withdrawal) => {
    if (confirm(`Unblock ${withdrawal.userName} from making withdrawals?`)) {
      await performAction(withdrawal.id, "unblock");
    }
  };

  const handleExportCSV = () => {
    const csvHeaders = ["ID", "User", "Email", "Amount", "Destination", "Status", "Fee", "Created", "Sent"];
    const csvData = withdrawals.map((w) => [
      w.id, w.userName, w.userEmail, w.amount, w.destinationAddress,
      w.status, w.fee, new Date(w.createdAt).toLocaleString(), w.sentAt ? new Date(w.sentAt).toLocaleString() : "N/A",
    ]);

    const csv = [csvHeaders.join(","), ...csvData.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `withdrawals_${new Date().toISOString()}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-gray-600 border-t-white rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading withdrawals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Withdrawals</h1>
          <p className="text-gray-400 text-sm mt-1">Monitor and process user withdrawals</p>
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
        <OverViewCard title="Total Withdrawals" value={`${totalWithdrawals}`} />
        <OverViewCard title="Queued Withdrawals" value={`${queuedWithdrawals}`} />
        <OverViewCard title="Pending Withdrawals" value={`${pendingWithdrawals}`} />
        <OverViewCard title="Total Sent" value={`${totalAmount.toFixed(2)} DGB`} />
      </div>

      {/* Filters */}
      <div className="darkCard p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-400 text-sm mb-2 block">
              <FaSearch className="inline mr-2" />Search
            </label>
            <input
              type="text"
              placeholder="Search by user, email, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full fadeInput rounded-lg px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-2 block">
              <FaFilter className="inline mr-2" />Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="w-full fadeInput rounded-lg px-3 py-2 text-white"
            >
              <option value="all">All Status</option>
              <option value="queued">Queued</option>
              <option value="pending">Pending</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>
      </div>

      {/* Withdrawals List - Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {withdrawals.length === 0 ? (
          <div className="redCard p-8 text-center">
            <p className="text-gray-400">No withdrawals found</p>
          </div>
        ) : (
          withdrawals.map((withdrawal) => (
            <div key={withdrawal.id} className="redCard p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-semibold">{withdrawal.userName}</h3>
                  <p className="text-gray-400 text-xs">{withdrawal.userEmail}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    withdrawal.status === "sent" ? "bg-green-600 text-white"
                      : withdrawal.status === "pending" ? "bg-blue-600 text-white"
                      : withdrawal.status === "queued" ? "bg-yellow-600 text-white"
                      : withdrawal.status === "blocked" ? "bg-purple-600 text-white"
                      : "bg-red-600 text-white"
                  }`}
                >
                  {withdrawal.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                <div>
                  <p className="text-gray-400 text-xs">Amount</p>
                  <p className="text-white font-bold">{withdrawal.amount} DGB</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Fee</p>
                  <p className="text-white">{withdrawal.fee} DGB</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-400 text-xs">Destination</p>
                  <p className="text-white text-xs font-mono truncate">{withdrawal.destinationAddress}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-400 text-xs">Created</p>
                  <p className="text-white text-xs">{new Date(withdrawal.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {withdrawal.failureReason && (
                <div className="bg-red-900 border border-red-600 rounded p-2 mb-3">
                  <p className="text-red-400 text-xs">
                    <FaExclamationTriangle className="inline mr-1" />{withdrawal.failureReason}
                  </p>
                </div>
              )}

              {withdrawal.blockReason && (
                <div className="bg-purple-900 border border-purple-600 rounded p-2 mb-3">
                  <p className="text-purple-400 text-xs">
                    <FaBan className="inline mr-1" />{withdrawal.blockReason}
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-3 border-t border-gray-700">
                <button
                  onClick={() => setSelectedWithdrawal(withdrawal)}
                  className="flex-1 flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-xs transition"
                >
                  <FaEye /> Details
                </button>
                {withdrawal.status === "queued" && (
                  <>
                    <button
                      onClick={() => handleApprove(withdrawal)}
                      disabled={actionLoading}
                      className="flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-xs transition"
                    >
                      <FaCheckCircle /> Approve
                    </button>
                    <button
                      onClick={() => handleDeny(withdrawal)}
                      disabled={actionLoading}
                      className="flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-xs transition"
                    >
                      <FaTimesCircle /> Deny
                    </button>
                  </>
                )}
                {withdrawal.status === "failed" && (
                  <button
                    onClick={() => handleRetry(withdrawal)}
                    disabled={actionLoading}
                    className="flex items-center justify-center gap-1 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded text-xs transition"
                  >
                    <FaRedo /> Retry
                  </button>
                )}
                {withdrawal.status === "blocked" && (
                  <button
                    onClick={() => handleUnblock(withdrawal)}
                    disabled={actionLoading}
                    className="flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-xs transition"
                  >
                    <FaCheckCircle /> Unblock
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Withdrawals List - Desktop Table */}
      <div className="hidden lg:block redCard overflow-hidden">
        {withdrawals.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400">No withdrawals found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="darkCard">
                <tr>
                  <th className="text-left text-gray-400 font-medium py-3 px-4">User</th>
                  <th className="text-right text-gray-400 font-medium py-3 px-4">Amount</th>
                  <th className="text-left text-gray-400 font-medium py-3 px-4">Destination</th>
                  <th className="text-center text-gray-400 font-medium py-3 px-4">Status</th>
                  <th className="text-left text-gray-400 font-medium py-3 px-4">Created</th>
                  <th className="text-center text-gray-400 font-medium py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="border-t border-gray-800 hover:bg-gray-800 transition">
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-white font-medium">{withdrawal.userName}</p>
                        <p className="text-gray-400 text-xs">{withdrawal.userEmail}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-white font-mono font-semibold">{withdrawal.amount} DGB</span>
                      <p className="text-gray-400 text-xs">Fee: {withdrawal.fee} DGB</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-300 font-mono text-xs">
                        {withdrawal.destinationAddress.substring(0, 25)}...
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                          withdrawal.status === "sent" ? "bg-green-600 text-white"
                            : withdrawal.status === "pending" ? "bg-blue-600 text-white"
                            : withdrawal.status === "queued" ? "bg-yellow-600 text-white"
                            : withdrawal.status === "blocked" ? "bg-purple-600 text-white"
                            : "bg-red-600 text-white"
                        }`}
                      >
                        {withdrawal.status === "sent" && <FaCheckCircle />}
                        {withdrawal.status === "pending" && <FaClock />}
                        {withdrawal.status === "queued" && <FaClock />}
                        {withdrawal.status === "failed" && <FaTimesCircle />}
                        {withdrawal.status === "blocked" && <FaBan />}
                        {withdrawal.status}
                      </span>
                      {withdrawal.failureReason && (
                        <p className="text-red-400 text-xs mt-1">{withdrawal.failureReason}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-300 text-sm">
                      {new Date(withdrawal.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedWithdrawal(withdrawal)}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        {withdrawal.status === "queued" && (
                          <>
                            <button onClick={() => handleApprove(withdrawal)} disabled={actionLoading}
                              className="p-2 bg-green-600 hover:bg-green-700 text-white rounded transition" title="Approve">
                              <FaCheckCircle />
                            </button>
                            <button onClick={() => handleDeny(withdrawal)} disabled={actionLoading}
                              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition" title="Deny">
                              <FaTimesCircle />
                            </button>
                          </>
                        )}
                        {withdrawal.status === "failed" && (
                          <button onClick={() => handleRetry(withdrawal)} disabled={actionLoading}
                            className="p-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition" title="Retry">
                            <FaRedo />
                          </button>
                        )}
                        {withdrawal.status !== "blocked" && (
                          <button
                            onClick={() => { setSelectedWithdrawal(withdrawal); setShowBlockModal(true); }}
                            className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition" title="Block User">
                            <FaBan />
                          </button>
                        )}
                        {withdrawal.status === "blocked" && (
                          <button onClick={() => handleUnblock(withdrawal)} disabled={actionLoading}
                            className="p-2 bg-green-600 hover:bg-green-700 text-white rounded transition" title="Unblock User">
                            <FaCheckCircle />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Withdrawal Details Modal */}
      {selectedWithdrawal && !showBlockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="darkCard p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-xl font-bold">Withdrawal Details</h2>
              <button onClick={() => setSelectedWithdrawal(null)} className="text-gray-400 hover:text-white text-2xl">×</button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">User</p>
                  <p className="text-white font-medium">{selectedWithdrawal.userName}</p>
                  <p className="text-gray-400 text-xs">{selectedWithdrawal.userEmail}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs mt-1 ${
                    selectedWithdrawal.status === "sent" ? "bg-green-600 text-white"
                      : selectedWithdrawal.status === "pending" ? "bg-blue-600 text-white"
                      : selectedWithdrawal.status === "queued" ? "bg-yellow-600 text-white"
                      : selectedWithdrawal.status === "blocked" ? "bg-purple-600 text-white"
                      : "bg-red-600 text-white"
                  }`}>{selectedWithdrawal.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Amount</p>
                  <p className="text-white font-bold text-xl">{selectedWithdrawal.amount} DGB</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Network Fee</p>
                  <p className="text-gray-300 font-semibold text-xl">{selectedWithdrawal.fee} DGB</p>
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-1">Destination Address</p>
                <p className="text-white font-mono text-sm break-all bg-gray-800 p-2 rounded">
                  {selectedWithdrawal.destinationAddress}
                </p>
              </div>

              {selectedWithdrawal.txid && (
                <div>
                  <p className="text-gray-400 text-sm mb-1">Transaction ID</p>
                  <p className="text-white font-mono text-sm break-all bg-gray-800 p-2 rounded">{selectedWithdrawal.txid}</p>
                </div>
              )}
              {selectedWithdrawal.confirmations > 0 && (
                <div>
                  <p className="text-gray-400 text-sm">Confirmations</p>
                  <p className="text-green-400 font-semibold">{selectedWithdrawal.confirmations}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Created At</p>
                  <p className="text-white">{new Date(selectedWithdrawal.createdAt).toLocaleString()}</p>
                </div>
                {selectedWithdrawal.sentAt && (
                  <div>
                    <p className="text-gray-400 text-sm">Sent At</p>
                    <p className="text-white">{new Date(selectedWithdrawal.sentAt).toLocaleString()}</p>
                  </div>
                )}
              </div>

              {selectedWithdrawal.failureReason && (
                <div className="bg-red-900 border border-red-600 rounded-lg p-3">
                  <p className="text-red-400 text-sm">
                    <FaExclamationTriangle className="inline mr-2" />{selectedWithdrawal.failureReason}
                  </p>
                </div>
              )}

              {selectedWithdrawal.blockReason && (
                <div className="bg-purple-900 border border-purple-600 rounded-lg p-3">
                  <p className="text-purple-400 text-sm">
                    <FaBan className="inline mr-2" />{selectedWithdrawal.blockReason}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={() => setSelectedWithdrawal(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition">Close</button>
              {selectedWithdrawal.status === "failed" && (
                <button
                  onClick={() => { handleRetry(selectedWithdrawal); setSelectedWithdrawal(null); }}
                  className="flex-1 flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition"
                >
                  <FaRedo /> Retry Withdrawal
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Block User Modal */}
      {showBlockModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="redCard p-6 max-w-md w-full">
            <h2 className="text-white text-xl font-bold mb-4">Block User from Withdrawals</h2>

            <div className="mb-4">
              <p className="text-gray-400 text-sm mb-2">User</p>
              <p className="text-white font-medium">{selectedWithdrawal.userName}</p>
              <p className="text-gray-400 text-xs">{selectedWithdrawal.userEmail}</p>
            </div>

            <div className="mb-4">
              <label className="text-gray-400 text-sm mb-2 block">Reason for Blocking *</label>
              <textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Enter reason (e.g., Suspicious activity, fraud investigation)..."
                rows={3}
                className="w-full fadeInput rounded-lg px-4 py-2 text-white"
              />
            </div>

            <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-3 mb-4">
              <p className="text-yellow-400 text-sm">
                Warning: This will prevent the user from making any withdrawals until unblocked.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { setShowBlockModal(false); setBlockReason(""); }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleBlockUser}
                disabled={actionLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
              >
                {actionLoading ? "Processing..." : "Block User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}