"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaEdit,
  FaEye,
  FaUsers,
  FaClock,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import OverViewCard from "@/components/ui/OverViewCard";

interface Exam {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: number;
  passmark: number;
  totalQuestions: number;
  published: boolean;
  createdAt: string;
  publishedAt: string | null;
  totalAttempts: number;
  uniqueUsers: number;
  passRate: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
}

export default function ExamsPage() {
  const router = useRouter();
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchExams = async () => {
    try {
      const res = await fetch("/api/v1/admin/exams");
      if (res.ok) {
        const data: Exam[] = await res.json();
        setExam(data.length > 0 ? data[0] : null);
      }
    } catch (error) {
      console.error("Failed to fetch exams:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleDelete = async () => {
    if (!exam) return;
    if (!confirm("Are you sure you want to delete this exam? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/v1/admin/exams/${exam.id}`, { method: "DELETE" });
      if (res.ok) {
        setExam(null);
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.detail || "Failed to delete exam");
      }
    } catch {
      alert("Failed to delete exam");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-gray-600 border-t-white rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading exams...</p>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="space-y-6">
        <div className="gradientCard p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-gray-800 border rounded-full flex items-center justify-center mx-auto mb-4">
              <FaPlus className="text-white text-3xl" />
            </div>
            <h2 className="text-white text-2xl font-bold mb-2">No Active Exam</h2>
            <p className="text-gray-400 mb-6">
              There is currently no active exam. Create your first exam to get started.
            </p>
            <Link
              href="/admin/exams/create"
              className="inline-flex items-center gap-2 bg-[#8B2E2E] hover:bg-[#6d2424] text-white px-6 py-3 rounded-lg transition border"
            >
              <FaPlus /> Create New Exam
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Current Exam</h1>
          <p className="text-gray-400 text-sm mt-1">Manage and monitor the active exam</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/exams/${exam.id}`}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
            <FaEdit /> Edit Exam
          </Link>
          <Link href="/admin/exams/create"
            className="flex items-center gap-2 bg-[#8B2E2E] hover:bg-[#6d2424] text-white px-4 py-2 rounded-lg transition">
            <FaPlus /> Create New
          </Link>
        </div>
      </div>

      <div className="gradientCard p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-white text-xl font-bold">{exam.title}</h2>
            <p className="text-[#aaa] mt-2">{exam.description}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm ${exam.published ? "bg-green-600 text-white" : "bg-yellow-600 text-white"}`}>
            {exam.published ? "Published" : "Draft"}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="darkCard p-4">
            <p className="text-gray-400 text-sm flex items-center gap-2"><FaClock /> Duration</p>
            <p className="text-white text-lg font-bold mt-1">{exam.duration} min</p>
          </div>
          <div className="darkCard p-4">
            <p className="text-gray-400 text-sm">Questions</p>
            <p className="text-white text-lg font-bold mt-1">{exam.totalQuestions}</p>
          </div>
          <div className="darkCard p-4">
            <p className="text-gray-400 text-sm">Pass Mark</p>
            <p className="text-white text-lg font-bold mt-1">{exam.passmark}%</p>
          </div>
          <div className="darkCard p-4">
            <p className="text-gray-400 text-sm">Difficulty</p>
            <p className="text-white text-lg font-bold mt-1">{exam.difficulty}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <OverViewCard title="Total Attempts" value={exam.totalAttempts.toLocaleString()} icon={<FaUsers className="text-white text-2xl" />} />
        <OverViewCard title="Unique Users" value={exam.uniqueUsers.toLocaleString()} icon={<FaUsers className="text-white text-2xl" />} bgColor="bg-purple-500" />
        <OverViewCard title="Pass Rate" value={`${exam.passRate}%`} icon={<FaUsers className="text-white text-2xl" />} bgColor="bg-green-500" />
        <OverViewCard title="Average Score" value={`${exam.averageScore}%`} icon={<FaUsers className="text-white text-2xl" />} bgColor="bg-yellow-600" />
      </div>

      <div className="darkCard p-6">
        <h3 className="text-white text-lg font-semibold mb-4">Score Range</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-sm">Highest Score</p>
            <p className="text-green-400 text-2xl font-bold mt-1">{exam.highestScore}%</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Lowest Score</p>
            <p className="text-red-400 text-2xl font-bold mt-1">{exam.lowestScore}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href={`/admin/exams/${exam.id}/results`} className="darkCard p-6 hover:bg-gray-800 transition">
          <div className="flex items-center gap-3 mb-2">
            <FaEye className="text-green-400 text-xl" />
            <h4 className="text-white font-semibold">View Results</h4>
          </div>
          <p className="text-gray-400 text-sm">See detailed results and student performance</p>
        </Link>
        <Link href={`/admin/exams/${exam.id}`} className="darkCard p-6 hover:bg-gray-800 transition">
          <div className="flex items-center gap-3 mb-2">
            <FaEdit className="text-blue-400 text-xl" />
            <h4 className="text-white font-semibold">Edit Exam</h4>
          </div>
          <p className="text-gray-400 text-sm">Modify questions, settings, and details</p>
        </Link>
        <button className="darkCard p-6 hover:bg-gray-800 transition text-left" onClick={handleDelete}>
          <div className="flex items-center gap-3 mb-2">
            <FaTrash className="text-red-400 text-xl" />
            <h4 className="text-white font-semibold">Delete Exam</h4>
          </div>
          <p className="text-gray-400 text-sm">Permanently remove this exam and all data</p>
        </button>
      </div>
    </div>
  );
}