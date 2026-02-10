"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  FaNairaSign,
  FaTrophy,
  FaBullseye,
  FaChartLine,
} from "react-icons/fa6";
import { FaHeadset } from "react-icons/fa";
import { HiMoon, HiSun } from "react-icons/hi2";
import { useThemeStore } from "@/stores/useThemeStore";

const Footer = () => {
  const { status } = useSession();
  const pathname = usePathname() || "";
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const isExamLocked =
    pathname.includes("/start") || pathname.includes("/live-exam");

  if (isExamLocked) return null;

  const isLoggedIn = status === "authenticated";

  // Mock data — will be replaced with real API data
  const walletBalance = "12,500.00";
  const globalRank = 42;
  const winRate = 73;
  const avgScore = 82;

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--footer-bg)] backdrop-blur-xl border-t border-[var(--surface-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-11 flex items-center justify-between text-xs">
        {/* Left side — Wallet + Support */}
        <div className="flex items-center gap-4">
          {isLoggedIn && (
            <div className="flex items-center gap-1.5 text-[var(--muted)]">
              <FaNairaSign size={11} className="text-[#8B1E1E]" />
              <span className="font-mono font-medium text-[var(--text-primary)]">
                {walletBalance}
              </span>
            </div>
          )}

          <div className="w-px h-4 bg-[var(--divider)] hidden sm:block" />

          <button
            type="button"
            title="Support"
            className="flex items-center gap-1.5 text-[var(--muted)] hover:text-[var(--text-secondary)] transition"
          >
            <FaHeadset size={12} />
            <span className="hidden sm:inline">Support</span>
          </button>
        </div>

        {/* Right side — Rank, Win Rate, Avg Score, Theme */}
        <div className="flex items-center gap-4">
          {isLoggedIn && (
            <>
              <div className="flex items-center gap-1.5 text-[var(--muted)]">
                <FaTrophy size={11} className="text-yellow-500" />
                <span className="hidden sm:inline">Rank</span>
                <span className="font-mono font-medium text-[var(--text-primary)]">
                  #{globalRank}
                </span>
              </div>

              <div className="w-px h-4 bg-[var(--divider)]" />

              <div className="flex items-center gap-1.5 text-[var(--muted)]">
                <FaBullseye size={11} className="text-green-500" />
                <span className="hidden sm:inline">Win</span>
                <span className="font-mono font-medium text-[var(--text-primary)]">
                  {winRate}%
                </span>
              </div>

              <div className="w-px h-4 bg-[var(--divider)]" />

              <div className="flex items-center gap-1.5 text-[var(--muted)]">
                <FaChartLine size={11} className="text-blue-400" />
                <span className="hidden sm:inline">Avg</span>
                <span className="font-mono font-medium text-[var(--text-primary)]">
                  {avgScore}%
                </span>
              </div>

              <div className="w-px h-4 bg-[var(--divider)]" />
            </>
          )}

          <button
            type="button"
            title="Toggle theme"
            onClick={toggleTheme}
            className="p-1.5 rounded-full hover:bg-[var(--surface)] transition text-[var(--muted)] hover:text-[var(--text-primary)]"
          >
            {theme === "dark" ? <HiMoon size={14} /> : <HiSun size={14} />}
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
