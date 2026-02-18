"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaTimesCircle,
  FaDownload,
  FaRedo,
  FaBan,
  FaFilter,
  FaSearch,
} from "react-icons/fa";

interface ExamInfo {
  id: string;
  title: string;
  totalQuestions: number;
  passmark: number;
  duration: number;
}

interface Result {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  score: number;
  totalPoints: number;
  maxPoints: number;
  passed: boolean;
  timeSpent: number;
  completedAt: string;
  status: string;
}

export default function ExamResultsPage() {
  const params = useParams();
  const examId = params.examId as string;

  const [examInfo, setExamInfo] = useState<ExamInfo | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "passed" | "failed">("all");
  const [sortBy, setSortBy] = useState<"score" | "name" | "date">("score");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchResults = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/admin/exams/${examId}/results`);
      if (res.ok) {
        const data = await res.json();
        setExamInfo(data.exam);
        setResults(data.results);
      }
    } catch (error) {
      console.error("Failed to fetch results:", error);
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Calculate stats from completed results
  const completedResults = results.filter((r) => r.status === "completed");
  const totalAttempts = completedResults.length;
  const passedCount = completedResults.filter((r) => r.passed).length;
  const failedCount = completedResults.filter((r) => !r.passed).length;
  const passRate = totalAttempts > 0 ? Math.round((passedCount / totalAttempts) * 100) : 0;
  const averageScore = totalAttempts > 0
    ? Math.round(completedResults.reduce((sum, r) => sum + r.score, 0) / totalAttempts)
    : 0;
  const highestScore = completedResults.length > 0
    ? Math.max(...completedResults.map((r) => r.score))
    : 0;
  const lowestScore = completedResults.length > 0
    ? Math.min(...completedResults.map((r) => r.score))
    : 0;

  // Filter and sort results
  const filteredResults = completedResults
    .filter((result) => {
      const matchesSearch =
        result.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "passed" && result.passed) ||
        (filterStatus === "failed" && !result.passed);
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "score") return b.score - a.score;
      if (sortBy === "name") return a.userName.localeCompare(b.userName);
      if (sortBy === "date")
        return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
      return 0;
    });

  const handleInvalidate = async (resultId: string) => {
    if (!confirm("Are you sure you want to invalidate this attempt? This will mark it as void.")) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/exams/${examId}/results/${resultId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "invalidate" }),
      });
      if (res.ok) {
        fetchResults();
      } else {
        const err = await res.json();
        alert(err.detail || "Failed to invalidate");
      }
    } catch {
      alert("Failed to invalidate");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReset = async (resultId: string) => {
    if (!confirm("Are you sure you want to reset this user's attempts? They will be able to retake the exam.")) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/exams/${examId}/results/${resultId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      if (res.ok) {
        fetchResults();
      } else {
        const err = await res.json();
        alert(err.detail || "Failed to reset");
      }
    } catch {
      alert("Failed to reset");
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCSV = () => {
    const csvHeaders = ["Name", "Email", "Score", "Points", "Status", "Time Spent", "Completed At"];
    const csvData = filteredResults.map((r) => [
      r.userName, r.userEmail, r.score, `${r.totalPoints}/${r.maxPoints}`,
      r.passed ? "Passed" : "Failed", `${r.timeSpent} min`,
      new Date(r.completedAt).toLocaleString(),
    ]);

    const csv = [csvHeaders.join(","), ...csvData.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `exam_${examId}_results.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-gray-600 border-t-white rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Link href="/admin/exams" className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-2">
            <FaArrowLeft /> Back to Exam
          </Link>
          <h1 className="text-2xl font-bold text-white">{examInfo?.title || "Exam Results"}</h1>
          <p className="text-gray-400 text-sm mt-1">Exam Results & Analytics</p>
        </div>
        <button onClick={handleExportCSV}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition w-fit">
          <FaDownload /> Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="redCard p-6">
          <p className="text-gray-400 text-sm">Total Attempts</p>
          <h3 className="text-white text-3xl font-bold mt-2">{totalAttempts}</h3>
        </div>
        <div className="redCard p-6">
          <p className="text-gray-400 text-sm">Pass Rate</p>
          <h3 className="text-white text-3xl font-bold mt-2">{passRate}%</h3>
          <p className="text-green-400 text-xs mt-1">{passedCount} passed &bull; {failedCount} failed</p>
        </div>
        <div className="redCard p-6">
          <p className="text-gray-400 text-sm">Average Score</p>
          <h3 className="text-white text-3xl font-bold mt-2">{averageScore}%</h3>
        </div>
        <div className="redCard p-6">
          <p className="text-gray-400 text-sm">Score Range</p>
          <h3 className="text-white text-3xl font-bold mt-2">{lowestScore}-{highestScore}%</h3>
        </div>
      </div>

      {/* Filters */}
      <div className="redCard p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-gray-400 text-sm mb-2 block"><FaSearch className="inline mr-2" />Search</label>
            <input type="text" placeholder="Search by name or email..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full fadeInput rounded-lg px-3 py-2 text-white" />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-2 block"><FaFilter className="inline mr-2" />Filter by Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="w-full fadeInput rounded-lg px-3 py-2 text-white">
              <option value="all">All Status</option>
              <option value="passed">Passed Only</option>
              <option value="failed">Failed Only</option>
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Sort By</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="w-full fadeInput rounded-lg px-3 py-2 text-white">
              <option value="score">Score (High to Low)</option>
              <option value="name">Name (A-Z)</option>
              <option value="date">Date (Recent First)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results - Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {filteredResults.length === 0 ? (
          <div className="darkCard p-8 text-center">
            <p className="text-gray-400">No results found</p>
          </div>
        ) : (
          filteredResults.map((result) => (
            <div key={result.id} className="darkCard p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-semibold">{result.userName}</h3>
                  <p className="text-gray-400 text-xs">{result.userEmail}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${result.passed ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
                  {result.passed ? "Passed" : "Failed"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                <div>
                  <p className="text-gray-400 text-xs">Score</p>
                  <p className="text-white font-bold text-lg">{result.score}%</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Points</p>
                  <p className="text-white">{result.totalPoints}/{result.maxPoints}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Time Spent</p>
                  <p className="text-white">{result.timeSpent} min</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Completed</p>
                  <p className="text-white text-xs">{new Date(result.completedAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-700">
                <button onClick={() => handleInvalidate(result.id)} disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-1 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded text-xs transition">
                  <FaBan /> Invalidate
                </button>
                <button onClick={() => handleReset(result.id)} disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-xs transition">
                  <FaRedo /> Reset
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Results - Desktop Table */}
      <div className="hidden lg:block darkCard overflow-hidden">
        {filteredResults.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400">No results found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#8B2E2E]">
                <tr>
                  <th className="text-left text-gray-400 font-medium py-3 px-4">Student</th>
                  <th className="text-center text-gray-400 font-medium py-3 px-4">Score</th>
                  <th className="text-center text-gray-400 font-medium py-3 px-4">Points</th>
                  <th className="text-center text-gray-400 font-medium py-3 px-4">Time</th>
                  <th className="text-center text-gray-400 font-medium py-3 px-4">Status</th>
                  <th className="text-left text-gray-400 font-medium py-3 px-4">Completed At</th>
                  <th className="text-center text-gray-400 font-medium py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((result) => (
                  <tr key={result.id} className="border-t border-[#8B2E2E] hover:bg-gray-800 transition">
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-white font-medium">{result.userName}</p>
                        <p className="text-gray-400 text-xs">{result.userEmail}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-lg font-bold ${examInfo && result.score >= examInfo.passmark ? "text-green-400" : "text-red-400"}`}>
                        {result.score}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-white">{result.totalPoints}/{result.maxPoints}</td>
                    <td className="py-3 px-4 text-center text-white">{result.timeSpent} min</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${result.passed ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
                        {result.passed ? (<><FaCheckCircle /> Passed</>) : (<><FaTimesCircle /> Failed</>)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-300 text-sm">{new Date(result.completedAt).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleInvalidate(result.id)} disabled={actionLoading}
                          className="p-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition" title="Invalidate Attempt">
                          <FaBan />
                        </button>
                        <button onClick={() => handleReset(result.id)} disabled={actionLoading}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition" title="Reset User Attempts">
                          <FaRedo />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}