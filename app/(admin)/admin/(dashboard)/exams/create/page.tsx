"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaPlus,
  FaTrash,
  FaSave,
  FaArrowLeft,
  FaEye,
  FaRegCheckSquare,
} from "react-icons/fa";
import Link from "next/link";
import { CiAlarmOn } from "react-icons/ci";
import { MdOutlineNoteAlt } from "react-icons/md";

type Question = {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: number; // index of correct option
  points: number;
};

export default function CreateExamPage() {
  const router = useRouter();

  // Exam basic details
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Mathematics");
  const [difficulty, setDifficulty] = useState("Medium");
  const [duration, setDuration] = useState(60);
  const [passmark, setPassmark] = useState(70);

  // Questions
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);

  // Current question being added
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentOptions, setCurrentOptions] = useState(["", "", "", ""]);
  const [currentCorrectAnswer, setCurrentCorrectAnswer] = useState(0);
  const [currentPoints, setCurrentPoints] = useState(1);

  // Preview mode
  const [previewMode, setPreviewMode] = useState(false);

  // Add question to list
  const handleAddQuestion = () => {
    if (!currentQuestion.trim()) {
      alert("Please enter a question");
      return;
    }

    if (currentOptions.some((opt) => !opt.trim())) {
      alert("Please fill all options");
      return;
    }

    const newQuestion: Question = {
      id: Date.now().toString(),
      questionText: currentQuestion,
      options: currentOptions,
      correctAnswer: currentCorrectAnswer,
      points: currentPoints,
    };

    setQuestions([...questions, newQuestion]);

    // Reset form
    setCurrentQuestion("");
    setCurrentOptions(["", "", "", ""]);
    setCurrentCorrectAnswer(0);
    setCurrentPoints(1);
    setShowQuestionForm(false);
  };

  // Remove question
  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  // Update option
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...currentOptions];
    newOptions[index] = value;
    setCurrentOptions(newOptions);
  };

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Submit exam
  const handleSubmit = async (publish: boolean) => {
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
      const res = await fetch("/api/v1/admin/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          difficulty,
          duration,
          passmark,
          published: publish,
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
        setSubmitError(err.detail || "Failed to create exam");
      }
    } catch {
      setSubmitError("Failed to create exam");
    } finally {
      setSubmitting(false);
    }
  };

  if (previewMode) {
    return (
      <div className="space-y-6">
        {/* Preview Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPreviewMode(false)}
            className="flex items-center gap-2 text-[#8B2E2E] hover:text-gray-300"
          >
            <FaArrowLeft /> Back to Edit
          </button>
          <span className="text-gray-400">Preview Mode</span>
        </div>

        {/* Exam Preview */}
        <div className="redCard border border-gray-700 rounded-lg p-6">
          <h1 className="text-white text-2xl font-bold mb-2">{title}</h1>
          <p className="text-[#aaa] mb-4">{description}</p>
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
            <div key={q.id} className="redCard rounded-lg p-6">
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
                        : "bg-gray-800 border-gray-700"
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Create New Exam</h1>
          <p className="text-gray-400 text-sm mt-1">
            Fill in the details and add questions
          </p>
        </div>
        <Link
          href="/admin/exams"
          className="flex items-center gap-2 text-[#8B2E2E] hover:text-white transition"
        >
          <FaArrowLeft /> Back
        </Link>
      </div>

      {/* Exam Basic Details */}
      <div className="redCard border border-gray-700 rounded-lg p-6">
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
              className="w-full 700 fadeInput rounded-lg px-4 py-2 text-white"
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
      <div className="redCard border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-white text-lg font-semibold">Questions</h2>
            <p className="text-gray-400 text-sm">
              {questions.length} question(s) added
            </p>
          </div>
          <button
            onClick={() => setShowQuestionForm(!showQuestionForm)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
          >
            <FaPlus /> Add Question
          </button>
        </div>

        {/* Add Question Form */}
        {showQuestionForm && (
          <div className="fadeInput border border-gray-700 rounded-lg p-6 mb-4">
            <h3 className="text-white font-semibold mb-4">New Question</h3>

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
                className="w-full darkCard rounded-lg px-4 py-2 text-white"
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
                      className="flex-1 darkCard rounded-lg px-4 py-2 text-white"
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
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleAddQuestion}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
              >
                <FaPlus /> Add Question
              </button>
              <button
                onClick={() => {
                  setShowQuestionForm(false);
                  setCurrentQuestion("");
                  setCurrentOptions(["", "", "", ""]);
                  setCurrentCorrectAnswer(0);
                }}
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
              <div
                key={q.id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-4"
              >
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
                  <button
                    onClick={() => handleRemoveQuestion(q.id)}
                    className="text-red-400 hover:text-red-300 p-2"
                  >
                    <FaTrash />
                  </button>
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
          <FaSave /> {submitting ? "Saving..." : "Save as Draft"}
        </button>
        <button
          onClick={() => handleSubmit(true)}
          disabled={submitting}
          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition"
        >
          <FaSave /> {submitting ? "Publishing..." : "Publish Exam"}
        </button>
      </div>
    </div>
  );
}
