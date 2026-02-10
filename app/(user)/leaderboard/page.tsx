import Link from "next/link";
import { FaTrophy } from "react-icons/fa6";
import { FaArrowLeft } from "react-icons/fa";

const LeaderBoardPage = () => {
  return (
    <div className="w-full mb-25 text-white">
      {/* Back to Dashboard */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--text-primary)] transition mb-2 mt-4 ml-4 sm:ml-6"
      >
        <FaArrowLeft size={12} />
        Back to Dashboard
      </Link>

      {/* Global Leaderboard */}
      <div className="md:w-[95%] lg:w-[90%] mt-8 mx-auto bg-[#ffffff10] border border-[#ffffff20] rounded-3xl shadow-lg px-6 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <FaTrophy color="gold" size={20} />
          <h3 className="text-[18px] font-semibold">Global Leaderboard</h3>
        </div>

        <p className="text-[#aaa] text-sm mb-4">Live Results</p>

        {/* Leaderboard List */}
        <div className="flex flex-col gap-3">
          {[
            "AceBrain",
            "QuantumKid",
            "NovaMind",
            "LogicLord",
            "ByteQueen",
            "ThinkFast",
            "BrainiacX",
          ].map((name, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-[#00000030] border border-[#ffffff10] rounded-xl px-4 py-3"
            >
              <div className="flex items-center gap-4">
                <span className="text-[#aaa] font-semibold">#{index + 1}</span>
                <span className="font-medium">{name}</span>
              </div>
            </div>
          ))}
        </div>

        {/* See More */}
        <button className="mt-5 w-full py-3 bg-[#00000040] border border-[#ffffff30] rounded-xl text-sm text-white font-semibold hover:bg-[#00000060] transition">
          See remaining 1,230 participants
        </button>
      </div>
    </div>
  );
};

export default LeaderBoardPage;
