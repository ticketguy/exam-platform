"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  FaArrowRight,
  FaTrophy,
  FaMedal,
  FaCrown,
  FaUsers,
  FaGraduationCap,
  FaBolt,
  FaShieldAlt,
  FaChartLine,
} from "react-icons/fa";
import { FaNairaSign } from "react-icons/fa6";
import { GiOpenBook } from "react-icons/gi";
import { BiTimer } from "react-icons/bi";

// Mock data — top winners per arena
const arenaWinners = [
  {
    arena: "Mathematics Sprint",
    image: "/mathpic.png",
    prize: 50000,
    winners: [
      { name: "AceBrain", prize: 25000, rank: 1 },
      { name: "LogicLord", prize: 15000, rank: 2 },
      { name: "QuantumKid", prize: 10000, rank: 3 },
    ],
  },
  {
    arena: "Chemistry Blitz",
    image: "/chempic.png",
    prize: 35000,
    winners: [
      { name: "ByteQueen", prize: 18000, rank: 1 },
      { name: "ThinkFast", prize: 10000, rank: 2 },
      { name: "NovaMind", prize: 7000, rank: 3 },
    ],
  },
];

// Mock global leaderboard — top earners across all arenas
const globalLeaderboard = [
  { name: "AceBrain", totalWinnings: 125000, arenas: 8, wins: 12, rank: 1 },
  { name: "ByteQueen", totalWinnings: 98000, arenas: 6, wins: 9, rank: 2 },
  { name: "LogicLord", totalWinnings: 87000, arenas: 7, wins: 8, rank: 3 },
];

const features = [
  {
    icon: <FaChartLine size={24} />,
    title: "Stake Your Knowledge",
    description:
      "Like prediction markets, but for what you already know. Put your money where your mind is — back yourself with a small entry fee.",
  },
  {
    icon: <GiOpenBook size={24} />,
    title: "Knowledge Arenas",
    description:
      "Each arena is a topic pool. Participants stake their entry, compete on timed questions, and the sharpest minds take the pot.",
  },
  {
    icon: <FaNairaSign size={24} />,
    title: "Get Paid to Know",
    description:
      "The prize pool grows with every entry. Top scorers split the pool — the more you know, the more you earn. Real knowledge, real money.",
  },
  {
    icon: <FaShieldAlt size={24} />,
    title: "Transparent & Fair",
    description:
      "Randomized questions, anti-cheat systems, and live scoring. No advantage for anyone — pure knowledge determines the outcome.",
  },
];

const rankColors: Record<number, string> = {
  1: "text-yellow-400",
  2: "text-gray-300",
  3: "text-orange-400",
};

const rankBg: Record<number, string> = {
  1: "bg-yellow-400/10 border-yellow-400/20",
  2: "bg-gray-300/10 border-gray-300/20",
  3: "bg-orange-400/10 border-orange-400/20",
};

export default function Page() {
  const router = useRouter();
  const { data: session } = useSession();
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [waitlistEnabled, setWaitlistEnabled] = useState(true);

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  useEffect(() => {
    fetch("/api/v1/settings")
      .then((res) => res.json())
      .then((data) => setWaitlistEnabled(data.waitlistEnabled))
      .catch(() => {});
  }, []);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail) return;
    setWaitlistLoading(true);
    // TODO: API call to save email to whitelist
    await new Promise((r) => setTimeout(r, 800));
    setWaitlistLoading(false);
    setWaitlistSubmitted(true);
    setWaitlistEmail("");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* ─── HEADER ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img
              src="/invertedLogo.png"
              alt="Nocho"
              className="h-9 w-auto object-contain"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <a
              href="#how-it-works"
              className="text-sm text-gray-400 hover:text-white transition"
            >
              How It Works
            </a>
            <a
              href="#winners"
              className="text-sm text-gray-400 hover:text-white transition"
            >
              Winners
            </a>
            <a
              href="#leaderboard"
              className="text-sm text-gray-400 hover:text-white transition"
            >
              Leaderboard
            </a>
          </nav>

          {waitlistEnabled ? (
            <a
              href="#waitlist"
              className="px-5 py-2 bg-[#8B1E1E] text-white text-sm font-semibold rounded-full hover:bg-[#a02424] transition-all shadow-lg shadow-[#8B1E1E]/20"
            >
              Join Waitlist
            </a>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-5 py-2 text-sm font-semibold text-white hover:text-gray-300 transition"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 bg-[#8B1E1E] text-white text-sm font-semibold rounded-full hover:bg-[#a02424] transition-all shadow-lg shadow-[#8B1E1E]/20"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Subtle gradient blobs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#8B1E1E]/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-[#8B1E1E]/10 rounded-full blur-[100px]" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/[0.06] border border-white/[0.1] rounded-full text-xs text-gray-400 mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Knowledge arenas are live
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight">
            The Knowledge Market
            <br />
            <span className="text-[#8B1E1E]">for Nigeria</span>
          </h1>

          <p className="mt-5 text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Prediction markets reward foresight. Nocho rewards{" "}
            <span className="text-white font-medium">what you already know</span>.
            Stake on your own knowledge, compete in timed arenas, and get paid
            for being the smartest in the room.
          </p>

          {/* CTA — Waitlist or Login/Signup */}
          <div id="waitlist" className="mt-8 max-w-md mx-auto">
            {waitlistEnabled ? (
              <>
                {waitlistSubmitted ? (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-2xl px-6 py-4 text-center">
                    <p className="text-green-400 font-semibold">
                      You&apos;re on the list!
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      We&apos;ll notify you when Nocho launches. You&apos;ll be
                      among the first to try it out.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleWaitlistSubmit} className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      required
                      value={waitlistEmail}
                      onChange={(e) => setWaitlistEmail(e.target.value)}
                      className="flex-1 bg-white/[0.06] border border-white/[0.12] rounded-full px-5 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#8B1E1E]/60 focus:bg-white/[0.08] transition"
                    />
                    <button
                      type="submit"
                      disabled={waitlistLoading}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8B1E1E] to-[#6b1717] text-white text-sm font-semibold rounded-full hover:from-[#a02424] hover:to-[#7a1c1c] transition-all shadow-lg shadow-[#8B1E1E]/25 disabled:opacity-50 whitespace-nowrap"
                    >
                      {waitlistLoading ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Join Waitlist <FaArrowRight size={12} />
                        </>
                      )}
                    </button>
                  </form>
                )}
                <p className="text-xs text-gray-600 mt-3 text-center">
                  Get priority access to the beta. No spam, ever.
                </p>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="flex gap-3">
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#8B1E1E] to-[#6b1717] text-white text-sm font-semibold rounded-full hover:from-[#a02424] hover:to-[#7a1c1c] transition-all shadow-lg shadow-[#8B1E1E]/25"
                  >
                    Get Started <FaArrowRight size={12} />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-8 py-3 bg-white/[0.06] border border-white/[0.12] text-white text-sm font-semibold rounded-full hover:bg-white/[0.1] transition"
                  >
                    Log In
                  </Link>
                </div>
                <p className="text-xs text-gray-600 text-center">
                  Free to join. Start competing in knowledge arenas today.
                </p>
              </div>
            )}
          </div>

          {/* Stats strip */}
          <div className="mt-14 flex flex-wrap justify-center gap-8 sm:gap-14">
            {[
              { label: "Knowledge Traders", value: "2,400+" },
              { label: "Total Payouts", value: "₦5M+" },
              { label: "Arenas Settled", value: "120+" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-16 px-4 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm text-[#8B1E1E] font-semibold uppercase tracking-wider mb-2">
              The Concept
            </p>
            <h2 className="text-3xl font-bold">
              Prediction Markets Meet Knowledge
            </h2>
            <p className="text-gray-400 mt-3 max-w-2xl mx-auto">
              In prediction markets, you stake money on what you think will
              happen. On Nocho, you stake money on{" "}
              <span className="text-white">what you already know</span>. If your
              knowledge is real, you profit. Simple as that.
            </p>
          </div>

          {/* Steps */}
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Pick an Arena",
                desc: "Browse open knowledge arenas — Mathematics, Science, Nigerian History, Current Affairs, and more. Each has a stake amount and prize pool.",
              },
              {
                step: "02",
                title: "Stake & Compete",
                desc: "Pay a small entry fee to join. You're not gambling — you're backing your own knowledge. Compete in timed exams against other participants.",
              },
              {
                step: "03",
                title: "Prove & Profit",
                desc: "Score higher than others and take your share of the pool. The smarter you are, the more you earn. Knowledge is literally money.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6"
              >
                <span className="text-4xl font-black text-[#8B1E1E]/20">
                  {item.step}
                </span>
                <h3 className="text-lg font-semibold mt-2 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold">Why Nocho</h2>
            <p className="text-gray-400 mt-3 max-w-xl mx-auto">
              A knowledge market built for Nigerians who believe what they know
              has real value.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.06] transition group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#8B1E1E]/15 flex items-center justify-center text-[#8B1E1E] mb-4 group-hover:bg-[#8B1E1E]/25 transition">
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* About section with images */}
          <div className="mt-20 grid md:grid-cols-2 gap-8 items-center">
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="relative h-52 rounded-2xl overflow-hidden">
                  <img
                    src="/mathpic.png"
                    alt="Mathematics Arena"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-3 left-3 text-xs font-medium bg-black/40 backdrop-blur-sm px-2 py-1 rounded-lg">
                    Math Arena
                  </span>
                </div>
                <div className="relative h-52 rounded-2xl overflow-hidden mt-8">
                  <img
                    src="/chempic.png"
                    alt="Chemistry Arena"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-3 left-3 text-xs font-medium bg-black/40 backdrop-blur-sm px-2 py-1 rounded-lg">
                    Chemistry Arena
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-4">
                Your Knowledge Has Real Value
              </h3>
              <p className="text-gray-400 leading-relaxed mb-4">
                Think of Nocho like a stock market — but instead of trading
                stocks, you&apos;re trading on your own intelligence. Every arena
                is a market where participants stake their entry, and the ones
                who prove they know the most walk away with the profits.
              </p>
              <p className="text-gray-400 leading-relaxed mb-6">
                Whether it&apos;s JAMB-level science, Nigerian history, current
                affairs, or professional certifications — if you know it, you can
                earn from it. No luck involved. No predictions about the future.
                Just pure, verifiable knowledge.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 bg-white/[0.06] border border-white/[0.1] rounded-full text-xs text-gray-300">
                  <FaGraduationCap className="inline mr-1.5" size={12} />
                  Academic Arenas
                </span>
                <span className="px-4 py-2 bg-white/[0.06] border border-white/[0.1] rounded-full text-xs text-gray-300">
                  <BiTimer className="inline mr-1.5" size={12} />
                  Timed Markets
                </span>
                <span className="px-4 py-2 bg-white/[0.06] border border-white/[0.1] rounded-full text-xs text-gray-300">
                  <FaUsers className="inline mr-1.5" size={12} />
                  2,400+ Traders
                </span>
                <span className="px-4 py-2 bg-white/[0.06] border border-white/[0.1] rounded-full text-xs text-gray-300">
                  <FaBolt className="inline mr-1.5" size={12} />
                  Instant Payouts
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── ARENA WINNERS ─── */}
      <section id="winners" className="py-20 px-4 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold">Recent Arena Payouts</h2>
            <p className="text-gray-400 mt-3 max-w-xl mx-auto">
              Top earners from recent knowledge arenas. The sharpest minds take
              the biggest share.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {arenaWinners.map((arena) => (
              <div
                key={arena.arena}
                className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden"
              >
                {/* Arena header with image */}
                <div className="relative h-40">
                  <img
                    src={arena.image}
                    alt={arena.arena}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
                  <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                    <div>
                      <h3 className="text-lg font-bold">{arena.arena}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Pool: ₦{arena.prize.toLocaleString()}
                      </p>
                    </div>
                    <FaTrophy size={20} className="text-yellow-400" />
                  </div>
                </div>

                {/* Winners list */}
                <div className="p-5 space-y-3">
                  {arena.winners.map((winner) => (
                    <div
                      key={winner.name}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border ${
                        rankBg[winner.rank]
                      } ${winner.rank === 1 ? "scale-[1.02]" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8">
                          {winner.rank === 1 ? (
                            <FaCrown
                              size={18}
                              className={rankColors[winner.rank]}
                            />
                          ) : (
                            <FaMedal
                              size={16}
                              className={rankColors[winner.rank]}
                            />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{winner.name}</p>
                          <p className="text-xs text-gray-500">
                            Rank #{winner.rank}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-green-400">
                        +₦{winner.prize.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── GLOBAL LEADERBOARD ─── */}
      <section id="leaderboard" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold">Top Knowledge Traders</h2>
            <p className="text-gray-400 mt-3 max-w-xl mx-auto">
              The highest earners across all arenas. These traders consistently
              prove they know more than the competition.
            </p>
          </div>

          {/* Podium — top 3 */}
          <div className="flex flex-col items-center gap-6 mb-10">
            {/* #1 — Hero card */}
            <div className="w-full max-w-lg bg-gradient-to-br from-[#8B1E1E]/30 to-[#8B1E1E]/5 border border-[#8B1E1E]/30 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <FaCrown size={28} className="text-yellow-400 opacity-60" />
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-yellow-400/15 border-2 border-yellow-400/40 flex items-center justify-center text-xl font-bold text-yellow-400">
                  1
                </div>
                <div className="flex-1">
                  <p className="text-xl font-bold">
                    {globalLeaderboard[0].name}
                  </p>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {globalLeaderboard[0].wins} wins across{" "}
                    {globalLeaderboard[0].arenas} arenas
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-400">
                    ₦{globalLeaderboard[0].totalWinnings.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">Total Earnings</p>
                </div>
              </div>
            </div>

            {/* #2 and #3 */}
            <div className="w-full max-w-lg grid grid-cols-2 gap-4">
              {globalLeaderboard.slice(1).map((player) => (
                <div
                  key={player.name}
                  className={`rounded-2xl p-5 border ${rankBg[player.rank]}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${rankColors[player.rank]} bg-white/[0.06]`}
                    >
                      {player.rank}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{player.name}</p>
                      <p className="text-xs text-gray-500">
                        {player.wins} wins
                      </p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-green-400">
                    ₦{player.totalWinnings.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {player.arenas} arenas
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-[#8B1E1E]/20 to-transparent border border-[#8B1E1E]/20 rounded-3xl p-10 sm:p-14">
            <h2 className="text-3xl font-bold mb-4">
              Your Knowledge is Worth Money
            </h2>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
              {waitlistEnabled
                ? "Stop studying for free. Join the waitlist and be the first to earn from what you already know when Nocho launches."
                : "Stop studying for free. Sign up now and start earning from what you already know."}
            </p>
            {waitlistEnabled ? (
              waitlistSubmitted ? (
                <p className="text-green-400 font-semibold">
                  You&apos;re already on the list!
                </p>
              ) : (
                <form
                  onSubmit={handleWaitlistSubmit}
                  className="flex gap-2 max-w-md mx-auto"
                >
                  <input
                    type="email"
                    placeholder="Enter your email"
                    required
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    className="flex-1 bg-white/[0.06] border border-white/[0.12] rounded-full px-5 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#8B1E1E]/60 focus:bg-white/[0.08] transition"
                  />
                  <button
                    type="submit"
                    disabled={waitlistLoading}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8B1E1E] to-[#6b1717] text-white text-sm font-semibold rounded-full hover:from-[#a02424] hover:to-[#7a1c1c] transition-all shadow-lg shadow-[#8B1E1E]/25 disabled:opacity-50 whitespace-nowrap"
                  >
                    {waitlistLoading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Join <FaArrowRight size={12} />
                      </>
                    )}
                  </button>
                </form>
              )
            ) : (
              <div className="flex justify-center gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#8B1E1E] to-[#6b1717] text-white text-sm font-semibold rounded-full hover:from-[#a02424] hover:to-[#7a1c1c] transition-all shadow-lg shadow-[#8B1E1E]/25"
                >
                  Get Started <FaArrowRight size={12} />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-white/[0.06] border border-white/[0.12] text-white text-sm font-semibold rounded-full hover:bg-white/[0.1] transition"
                >
                  Log In
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/[0.06] bg-[#050505]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-8">
          {/* Top section — logo + columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <img
                src="/invertedLogo.png"
                alt="Nocho"
                className="h-8 w-auto object-contain mb-4"
              />
              <p className="text-sm text-gray-500 leading-relaxed">
                Nigeria&apos;s knowledge market. Prove what you know, earn what
                you deserve.
              </p>
            </div>

            {/* Platform */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">
                Platform
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <a
                    href="#how-it-works"
                    className="text-sm text-gray-500 hover:text-gray-300 transition"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="#waitlist"
                    className="text-sm text-gray-500 hover:text-gray-300 transition"
                  >
                    Join Waitlist
                  </a>
                </li>
                <li>
                  <a
                    href="#winners"
                    className="text-sm text-gray-500 hover:text-gray-300 transition"
                  >
                    Winners
                  </a>
                </li>
                <li>
                  <a
                    href="#leaderboard"
                    className="text-sm text-gray-500 hover:text-gray-300 transition"
                  >
                    Leaderboard
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">
                Company
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-300 transition"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-300 transition"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-300 transition"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-300 transition"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2.5">
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-300 transition"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-300 transition"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-300 transition"
                  >
                    Fair Play Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-300 transition"
                  >
                    Refund Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600">
              &copy; {new Date().getFullYear()} Nocho Technologies. All rights
              reserved.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="text-gray-600 hover:text-gray-400 transition"
                aria-label="Twitter"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-gray-400 transition"
                aria-label="Instagram"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-gray-400 transition"
                aria-label="LinkedIn"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
