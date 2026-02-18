"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FaPlus,
  FaTrash,
  FaSave,
  FaArrowLeft,
  FaEye,
  FaEdit,
  FaTimes,
  FaRegCheckSquare,
} from "react-icons/fa";
import Link from "next/link";
import { CiAlarmOn } from "react-icons/ci";
import { MdOutlineNoteAlt } from "react-icons/md";

type Question = {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  points: number;
};

export default function EditExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId as string;

  // Exam basic details
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Mathematics");
  const [difficulty, setDifficulty] = useState("Medium");
  const [duration, setDuration] = useState(60);
  const [passmark, setPassmark] = useState(70);
  const [published, setPublished] = useState(false);

  // Questions
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null,
  );

  // Current question being added/edited
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentOptions, setCurrentOptions] = useState(["", "", "", ""]);
  const [currentCorrectAnswer, setCurrentCorrectAnswer] = useState(0);
  const [currentPoints, setCurrentPoints] = useState(1);

  // Preview mode
  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load existing exam data from API
  useEffect(() => {
    async function fetchExam() {
      try {
        const res = await fetch(`/api/v1/admin/exams/${examId}`);
        if (res.ok) {
          const exam = await res.json();
          setTitle(exam.title);
          setDescription(exam.description || "");
          setCategory(exam.category);
          setDifficulty(exam.difficulty);
          setDuration(exam.duration);
          setPassmark(exam.passmark);
          setPublished(exam.published);
          setQuestions(
            (exam.questions || []).map((q: { id: string; questionText: string; options: string | string[]; correctAnswer: number; points: number }) => ({
              id: q.id,
              questionText: q.questionText,
              options: typeof q.options === "string" ? JSON.parse(q.options) : q.options,
              correctAnswer: q.correctAnswer,
              points: q.points,
            }))
          );
        }
      } catch (error) {
        console.error("Failed to fetch exam:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchExam();
  }, [examId]);

  // Add or update question
  const handleSaveQuestion = () => {
    if (!currentQuestion.trim()) {
      alert("Please enter a question");
      return;
    }

    if (currentOptions.some((opt) => !opt.trim())) {
      alert("Please fill all options");
      return;
    }

    if (editingQuestionId) {
      // Update existing question
      setQuestions(
        questions.map((q) =>
          q.id === editingQuestionId
            ? {
                ...q,
                questionText: currentQuestion,
                options: currentOptions,
                correctAnswer: currentCorrectAnswer,
                points: currentPoints,
              }
            : q,
        ),
      );
    } else {
      // Add new question
      const newQuestion: Question = {
        id: Date.now().toString(),
        questionText: currentQuestion,
        options: currentOptions,
        correctAnswer: currentCorrectAnswer,
        points: currentPoints,
      };
      setQuestions([...questions, newQuestion]);
    }

    // Reset form
    resetQuestionForm();
  };

  // Edit question
  const handleEditQuestion = (question: Question) => {
    setCurrentQuestion(question.questionText);
    setCurrentOptions(question.options);
    setCurrentCorrectAnswer(question.correctAnswer);
    setCurrentPoints(question.points);
    setEditingQuestionId(question.id);
    setShowQuestionForm(true);
  };

  // Remove question
  const handleRemoveQuestion = (id: string) => {
    if (confirm("Are you sure you want to delete this question?")) {
      setQuestions(questions.filter((q) => q.id !== id));
    }
  };

  // Reset question form
  const resetQuestionForm = () => {
    setCurrentQuestion("");
    setCurrentOptions(["", "", "", ""]);
    setCurrentCorrectAnswer(0);
    setCurrentPoints(1);
    setEditingQuestionId(null);
    setShowQuestionForm(false);
  };

  // Update option
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...currentOptions];
    newOptions[index] = value;
    setCurrentOptions(newOptions);
  };

  // Submit exam
  const handleSubmit = async (shouldPublish: boolean) => {
    if (!title.trim()) {
      alert("Please enter exam title");
      return;
    }

    if (questions.length === 0) {
      alert("Please add at least one question");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch(`/api/v1/admin/exams/${examId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          difficulty,
          duration,
          passmark,
          published: shouldPublish,
          questions: questions.map((q) => ({
            questionText: q.questionText,
            options: q.options,
            correctAnswer: q.correctAnswer,
            points: q.points,
          })),
        }),
      });

      if (res.ok) {
        router.push("/admin/exams");
      } else {
        const err = await res.json();
        setSubmitError(err.detail || "Failed to update exam");
      }
    } catch {
      setSubmitError("Failed to update exam");
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle publish status
  const handleTogglePublish = async () => {
    const newStatus = !published;
    try {
      const res = await fetch(`/api/v1/admin/exams/${examId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: newStatus }),
      });
      if (res.ok) {
        setPublished(newStatus);
      } else {
        const err = await res.json();
        alert(err.detail || "Failed to toggle publish status");
      }
    } catch {
      alert("Failed to toggle publish status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-gray-600 border-t-white rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (previewMode) {
    return (
      <div className="space-y-6">
        {/* Preview Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPreviewMode(false)}
            className="flex items-center gap-2  hover:text-gray-300 text-[#aaa]"
          >
            <FaArrowLeft /> Back to Edit
          </button>
          <span className="text-gray-400">Preview Mode</span>
        </div>

        {/* Exam Preview */}
        <div className="redCard p-6">
          <h1 className="text-white text-2xl font-bold mb-2">{title}</h1>
          <p className="text-gray-400 mb-4">{description}</p>
          <div className="flex gap-4 text-sm text-[#aaa]">
            <span className="flex flex-row items-center gap-2">
              <CiAlarmOn color="white" /> {duration} minutes
            </span>
            <span className="flex flex-row items-center gap-2">
              <MdOutlineNoteAlt color="white" /> {questions.length} questions
            </span>
            <span className="flex flex-row items-center gap-2">
              <FaRegCheckSquare color="green" /> Pass mark: {passmark}%
            </span>
          </div>
        </div>

        {/* Questions Preview */}
        <div className="space-y-4">
          {questions.map((q, index) => (
            <div key={q.id} className="redCard p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-white font-semibold">
                  Question {index + 1}: {q.questionText}
                </h3>
                <span className="text-gray-400 text-sm">{q.points} pt(s)</span>
              </div>
              <div className="space-y-2">
                {q.options.map((option, optIndex) => (
                  <div
                    key={optIndex}
                    className={`p-3 rounded-lg border ${
                      optIndex === q.correctAnswer
                        ? "bg-green-900 border-green-600"
                        : "darkCard"
                    }`}
                  >
                    <span className="text-white">
                      {String.fromCharCode(65 + optIndex)}. {option}
                    </span>
                    {optIndex === q.correctAnswer && (
                      <span className="text-green-400 ml-2">(Correct)</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Link
            href="/admin/exams"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-2"
          >
            <FaArrowLeft /> Back to Exam
          </Link>
          <h1 className="text-2xl font-bold text-white">Edit Exam</h1>
          <p className="text-gray-400 text-sm mt-1">
            Modify exam details and questions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-sm ${
              published ? "bg-green-600 text-white" : "bg-yellow-600 text-white"
            }`}
          >
            {published ? "Published" : "Draft"}
          </span>
          <button
            onClick={handleTogglePublish}
            className={`px-4 py-2 rounded-lg transition ${
              published
                ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            {published ? "Unpublish" : "Publish"}
          </button>
        </div>
      </div>

      {/* Exam Basic Details */}
      <div className="redCard p-6">
        <h2 className="text-white text-lg font-semibold mb-4">Exam Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title */}
          <div className="md:col-span-2">
            <label className="text-gray-400 text-sm mb-2 block">
              Exam Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Mathematics Sprint 2025"
              className="w-full fadeInput rounded-lg px-4 py-2 text-white"
              required
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="text-gray-400 text-sm mb-2 block">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the exam..."
              rows={3}
              className="w-full fadeInput rounded-lg px-4 py-2 text-white"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-gray-400 text-sm mb-2 block">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full fadeInput rounded-lg px-4 py-2 text-white"
            >
              <option value="Mathematics">Mathematics</option>
              <option value="English">English</option>
              <option value="Science">Science</option>
              <option value="General">General Knowledge</option>
              <option value="Computer">Computer Science</option>
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="text-gray-400 text-sm mb-2 block">
              Difficulty *
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full fadeInput rounded-lg px-4 py-2 text-white"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="text-gray-400 text-sm mb-2 block">
              Duration (minutes) *
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              min="1"
              className="w-full fadeInput rounded-lg px-4 py-2 text-white"
            />
          </div>

          {/* Pass Mark */}
          <div>
            <label className="text-gray-400 text-sm mb-2 block">
              Pass Mark (%) *
            </label>
            <input
              type="number"
              value={passmark}
              onChange={(e) => setPassmark(Number(e.target.value))}
              min="0"
              max="100"
              className="w-full fadeInput rounded-lg px-4 py-2 text-white"
            />
          </div>
        </div>
      </div>

      {/* Questions Section */}
      <div className="redCard p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-white text-lg font-semibold">Questions</h2>
            <p className="text-gray-400 text-sm">
              {questions.length} question(s) added
            </p>
          </div>
          <button
            onClick={() => {
              if (showQuestionForm) {
                resetQuestionForm(); // Cancel/close form
              } else {
                setShowQuestionForm(true); // Open form
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              showQuestionForm
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-green-600 hover:bg-green-400 text-white"
            }`}
          >
            {showQuestionForm ? (
              <>
                <FaTimes /> Cancel
              </>
            ) : (
              <>
                <FaPlus /> Add Question
              </>
            )}
          </button>
        </div>

        {/* Add/Edit Question Form */}
        {showQuestionForm && (
          <div className="darkCard rounded-lg p-6 mb-4">
            <h3 className="text-white font-semibold mb-4">
              {editingQuestionId ? "Edit Question" : "New Question"}
            </h3>

            {/* Question Text */}
            <div className="mb-4">
              <label className="text-gray-400 text-sm mb-2 block">
                Question *
              </label>
              <textarea
                value={currentQuestion}
                onChange={(e) => setCurrentQuestion(e.target.value)}
                placeholder="Enter your question here..."
                rows={3}
                className="w-full fadeInput rounded-lg px-4 py-2 text-white"
              />
            </div>

            {/* Options */}
            <div className="mb-4">
              <label className="text-gray-400 text-sm mb-2 block">
                Options *
              </label>
              <div className="space-y-2">
                {currentOptions.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={currentCorrectAnswer === index}
                      onChange={() => setCurrentCorrectAnswer(index)}
                      className="w-4 h-4"
                    />
                    <span className="text-white font-semibold">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(index, e.target.value)
                      }
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      className="flex-1 fadeInput rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                ))}
              </div>
              <p className="text-gray-500 text-xs mt-2">
                Select the radio button for the correct answer
              </p>
            </div>

            {/* Points */}
            <div className="mb-4">
              <label className="text-gray-400 text-sm mb-2 block">Points</label>
              <input
                type="number"
                value={currentPoints}
                onChange={(e) => setCurrentPoints(Number(e.target.value))}
                min="1"
                className="w-full fadeInput rounded-lg px-4 py-2 text-white"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleSaveQuestion}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
              >
                <FaSave />{" "}
                {editingQuestionId ? "Update Question" : "Add Question"}
              </button>
              <button
                onClick={resetQuestionForm}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Questions List */}
        {questions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No questions added yet. Click &quot;Add Question&quot; to start.
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((q, index) => (
              <div key={q.id} className="fadeInput rounded-3xl p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-white font-medium mb-2">
                      {index + 1}. {q.questionText}
                    </p>
                    <div className="space-y-1">
                      {q.options.map((option, optIndex) => (
                        <p
                          key={optIndex}
                          className={`text-sm ${
                            optIndex === q.correctAnswer
                              ? "text-green-400"
                              : "text-gray-400"
                          }`}
                        >
                          {String.fromCharCode(65 + optIndex)}. {option}
                          {optIndex === q.correctAnswer && " ✓"}
                        </p>
                      ))}
                    </div>
                    <p className="text-gray-500 text-xs mt-2">
                      {q.points} point(s)
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditQuestion(q)}
                      className="text-blue-400 hover:text-blue-300 p-2"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleRemoveQuestion(q.id)}
                      className="text-red-400 hover:text-red-300 p-2"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error Display */}
      {submitError && (
        <div className="bg-red-900 border border-red-600 rounded-lg p-3">
          <p className="text-red-400 text-sm">{submitError}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row gap-4">
        <button
          onClick={() => setPreviewMode(true)}
          className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition"
          disabled={questions.length === 0}
        >
          <FaEye /> Preview Exam
        </button>
        <button
          onClick={() => handleSubmit(false)}
          disabled={submitting}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
        >
          <FaSave /> {submitting ? "Saving..." : "Save Changes"}
        </button>
        <button
          onClick={() => handleSubmit(true)}
          disabled={submitting}
          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition"
        >
          <FaSave /> {submitting ? "Publishing..." : "Save & Publish"}
        </button>
      </div>
    </div>
  );
}
