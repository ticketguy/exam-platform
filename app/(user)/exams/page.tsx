"use client";

import Link from "next/link";
import { BiTimer, BiWallet } from "react-icons/bi";
import { FaArrowLeft, FaArrowRight, FaRegCheckCircle, FaTrophy } from "react-icons/fa";

type ExamStatus = "registered" | "not_registered" | "low_balance";

const exam = {
  id: "math-sprint",
  title: "Mathematics Sprint",
  subject: "Mathematics",
  prize: 5000,
  fee: 50,
  startsAt: "10:00 AM",
  image: "/mathpic.png",
};

// 🔥 THIS IS THE ONLY THING THAT CHANGES
const userExamStatus: ExamStatus = "not_registered";
// try: "not_registered" | "low_balance"

export default function ExamsPage() {
  const isRegistered = userExamStatus === "registered";
  const isLowBalance = userExamStatus === "low_balance";

  const buttonLabel = isRegistered
    ? "Enter Exam"
    : isLowBalance
      ? "Top Up Wallet"
      : "Register Now";

  const buttonHref = isRegistered
    ? `/exams/${exam.id}/start`
    : isLowBalance
      ? "/wallet"
      : `/exams/${exam.id}`;

  return (
    <div className="text-white mb-40">
      {/* Back to Dashboard */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--text-primary)] transition mb-4"
      >
        <FaArrowLeft size={12} />
        Back to Dashboard
      </Link>

      <h1 className="text-[40px] font-semibold">Exam Arena</h1>
      <p className="text-[#aaa]">
        Select the exam below to compete for cash prizes.
      </p>

      {/* ✅ SINGLE CARD */}
      <div className="mt-5">
        <div
          className={`rounded-3xl shadow-md overflow-hidden w-full md:w-70 cursor-pointer ${
            isRegistered
              ? "border-4 border-dashed border-green-700 p-3"
              : "border bg-[#8B1E1E]"
          }`}
        >
          {/* Image */}
          <div className="relative w-full h-37">
            <img
              src={exam.image}
              alt={exam.title}
              className="object-cover w-full h-full rounded-t-3xl"
            />

            {/* Status Badge */}
            <span
              className={`absolute top-4 left-2 text-white text-xs font-semibold px-2 py-1 rounded-lg uppercase flex items-center gap-2 ${
                isLowBalance ? "bg-[#8B1E1E]" : "bg-green-400"
              }`}
            >
              {isLowBalance ? <BiWallet /> : <FaRegCheckCircle />}
              {isLowBalance ? "Low Balance" : "Available"}
            </span>

            {/* Bottom Overlay */}
            <div className="flex flex-col gap-1 absolute bottom-3 left-2 backdrop-blur-[2px] backdrop-brightness-90 p-3 rounded-md">
              <h2 className="font-semibold text-lg">{exam.title}</h2>
              <span className="flex items-center gap-2 text-white text-sm">
                <BiTimer size={14} />
                Starts at {exam.startsAt}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="p-4 flex flex-col gap-2 text-white bg-[#8B1E1E]">
            <div className="flex justify-between mt-2">
              <div>
                <p className="text-[#aaa] text-[12px] uppercase">Prize Pool</p>
                <p className="font-bold">₦{exam.prize.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[#aaa] text-[12px] uppercase">Entry Fee</p>
                <p className="font-bold">₦{exam.fee}</p>
              </div>
            </div>

            <hr className="my-3 border-gray-300" />

            <div className="flex items-center gap-2 text-[#aaa]">
              <FaTrophy color="yellow" />
              <p className="text-[13px]">
                {isRegistered
                  ? "Top 3 winners take all"
                  : "Top 10 winners share the pool"}
              </p>
            </div>

            {/* CTA */}
            <Link href={buttonHref}>
              <button className="mt-4 w-full py-2 bg-white text-[#8B1E1E] font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-[#ffffff10] hover:text-white hover:border hover:border-[#ffffff10] transition">
                {buttonLabel} <FaArrowRight />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
