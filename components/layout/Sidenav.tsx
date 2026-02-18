"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  FaBars,
  FaWallet,
  FaGraduationCap,
  FaTrophy,
  FaCog,
  FaUser,
} from "react-icons/fa";
import { GiOpenBook } from "react-icons/gi";

type UserSession = {
  id: string;
  nickname?: string;
  avatar?: string;
  name?: string | null;
  email?: string | null;
};

const DashboardShell = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname() || "";

  // Extract user info
  const user =
    status === "authenticated" ? (session?.user as UserSession) : undefined;
  const nickname = user?.nickname || user?.name || "Guest";
  const id = user?.id || "K000000";

  const links = [
    { name: "Dashboard", icon: <FaGraduationCap />, href: "/dashboard" },
    { name: "My Exams", icon: <GiOpenBook />, href: "/exams" },
    { name: "Wallet", icon: <FaWallet />, href: "/wallet" },
    { name: "Leaderboard", icon: <FaTrophy />, href: "/leaderboard" },
  ];

  const settings = {
    name: "Settings",
    icon: <FaCog />,
    href: "/settings",
  };

  const getPageTitle = () => {
    // Dashboard
    if (pathname.startsWith("/dashboard")) return "Dashboard Overview";

    // Wallet
    if (pathname.startsWith("/wallet")) return "Wallet";

    // Leaderboard
    if (pathname.startsWith("/leaderboard")) return "Leaderboard";

    // Settings
    if (pathname.startsWith("/settings")) return "Settings";

    // Exams
    if (pathname.startsWith("/exams")) {
      const parts = pathname.split("/").filter(Boolean);
      // e.g., ["exams", "math-sprint", "start"]

      if (parts.length === 1) return "My Exams"; // /exams
      if (parts.length === 2) {
        // /exams/[examId]
        return `Exam Details: ${parts[1].replace(/-/g, " ")}`;
      }
      if (parts.length === 3) {
        // /exams/[examId]/[page]
        const pageName = parts[2];
        return `Exam: ${parts[1].replace(/-/g, " ")} — ${capitalize(pageName)}`;
      }
    }
  };

  // helper
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  // lock suide nav when live exam is on
  const isExamLocked =
    pathname.includes("/start") || pathname.includes("/live-exam");

  return (
    <div className="flex h-screen w-full">
      {/* SideNav */}
      {!isExamLocked && (
        <aside
          className={`
      fixed top-0 left-0 h-full w-50 bg-black text-white z-50 border border-gray-700
      transform ${open ? "translate-x-0" : "-translate-x-full"}
      transition-transform duration-300 ease-in-out
      lg:translate-x-0 lg:static lg:flex lg:flex-col
    `}
        >
          {/* Logo Section */}
          <div className="flex justify-center items-center py-6 bg-black relative w-40 ml-5 h-18">
            <img
              src={"/invertedLogo.png"}
              alt="logo"
              className="h-full w-full absolute object-cover -bottom-2"
            />
          </div>

          <div className="flex flex-col h-full justify-between">
            <nav className="flex flex-col mt-4 px-4">
              {links.map((link) => {
                const isActive =
                  pathname === link.href ||
                  pathname.startsWith(`${link.href}/`);

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`
                    flex items-center gap-3 py-3 px-3 rounded-lg transition-all
                    ${
                      isActive
                        ? "bg-[#8B1E1E] text-white font-semibold shadow-lg"
                        : "text-gray-300 hover:bg-[#8b1e1e48] hover:text-white"
                    }
                  `}
                    onClick={() => setOpen(false)}
                  >
                    <span className={isActive ? "text-xl" : "text-lg"}>
                      {link.icon}
                    </span>
                    <span>{link.name}</span>
                  </Link>
                );
              })}

              <hr className="my-4 border-gray-700" />

              <Link
                href={settings.href}
                className={`
                flex items-center gap-3 py-3 px-3 rounded-lg transition-all
                ${
                  pathname === settings.href
                    ? "bg-blue-600 text-white font-semibold shadow-lg"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }
              `}
                onClick={() => setOpen(false)}
              >
                <span
                  className={pathname === settings.href ? "text-xl" : "text-lg"}
                >
                  {settings.icon}
                </span>
                <span>{settings.name}</span>
              </Link>
            </nav>

            {/* User info */}
            <div className="w-full flex items-center gap-3 p-4 border-t border-gray-700 mt-auto">
              <div className="w-10 h-10 shrink-0 bg-black rounded-full flex items-center justify-center">
                <FaUser className="text-gray-400" size={20} />
              </div>
              <div className="flex flex-col text-sm overflow-hidden">
                <span className="font-semibold truncate">{nickname}</span>
                <span className="text-gray-400 text-xs">{id}</span>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* TopNav */}
        {!isExamLocked && (
          <header className="w-full flex items-center gap-5 bg-black text-white p-4 border border-gray-700">
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden hover:bg-gray-700 p-2 rounded transition"
            >
              <FaBars size={24} />
            </button>
            <h1 className="font-bold text-lg">{getPageTitle()}</h1>
          </header>
        )}

        {/* Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden h-full p-6 bg-black">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-opacity-50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardShell;
