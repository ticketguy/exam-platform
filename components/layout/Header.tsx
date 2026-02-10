"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  FaBell,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaChevronDown,
  FaWallet,
  FaRegClock,
  FaCheckCircle,
} from "react-icons/fa";
import { FaTrophy } from "react-icons/fa6";
import { GiOpenBook } from "react-icons/gi";
import useProfileStore from "@/stores/useProfileStore";

const Header = () => {
  const { data: session, status } = useSession();
  const pathname = usePathname() || "";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const user = status === "authenticated" ? session?.user : undefined;
  const { displayName: profileDisplayName, nickname: profileNickname, avatar: profileAvatar } = useProfileStore();
  const name = profileDisplayName || profileNickname || user?.nickname || user?.name || "Guest";
  const avatar = profileAvatar;
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Mock notifications — replace with real data
  const notifications = [
    {
      id: 1,
      title: "Exam Starting Soon",
      message: "Physics Challenge starts in 30 minutes",
      time: "5 min ago",
      read: false,
      icon: <FaRegClock size={14} className="text-orange-400" />,
    },
    {
      id: 2,
      title: "Results Available",
      message: "Your Math Olympiad results are ready",
      time: "2 hours ago",
      read: false,
      icon: <FaCheckCircle size={14} className="text-green-400" />,
    },
    {
      id: 3,
      title: "Deposit Confirmed",
      message: "₦10,000 has been added to your wallet",
      time: "Yesterday",
      read: true,
      icon: <FaWallet size={14} className="text-blue-400" />,
    },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setNotifOpen(false);
  }, [pathname]);

  const isExamLocked =
    pathname.includes("/start") || pathname.includes("/live-exam");

  if (isExamLocked) return null;

  const menuItems = [
    { name: "Profile", icon: <FaUser size={14} />, href: "/profile" },
    { name: "Wallet", icon: <FaWallet size={14} />, href: "/wallet" },
    { name: "Settings", icon: <FaCog size={14} />, href: "/settings" },
  ];

  const isAnyOpen = menuOpen || notifOpen;

  return (
    <>
      {isAnyOpen && (
        <div
          className="fixed inset-0 z-40 bg-[var(--backdrop-bg)] backdrop-blur-sm"
          onClick={() => {
            setMenuOpen(false);
            setNotifOpen(false);
          }}
        />
      )}

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || isAnyOpen
            ? "bg-[var(--header-bg)] backdrop-blur-xl border-b border-[var(--surface-border)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center">
            <img
              src="/invertedLogo.png"
              alt="Nocho"
              className="h-10 w-auto object-contain logo-themed"
            />
          </Link>

          {/* Center nav group — Arena | Profile | Global Board */}
          <div className="absolute left-1/2 -translate-x-1/2 z-50 flex items-center gap-2">
            {/* Exam Arena island */}
            <Link
              href="/exams"
              className={`flex items-center gap-1.5 py-2 px-3 rounded-full text-sm font-medium transition-all ${
                pathname.startsWith("/exams")
                  ? "bg-[#8B1E1E] text-white shadow-lg shadow-[#8B1E1E]/20"
                  : "bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <GiOpenBook size={14} />
              <span className="hidden sm:inline">Arena</span>
            </Link>

            {/* Profile Dynamic Island — center */}
            <div ref={menuRef}>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(!menuOpen);
                  setNotifOpen(false);
                }}
                className={`flex items-center gap-2 py-1.5 pl-1.5 pr-3 rounded-full transition-all duration-300 ${
                  menuOpen
                    ? "bg-[#8B1E1E] shadow-lg shadow-[#8B1E1E]/20"
                    : "bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)]"
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-[#8B1E1E]/60 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                  {avatar ? (
                    <img src={avatar} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <span className="text-sm text-[var(--text-primary)] font-medium hidden sm:block">
                  {name}
                </span>
                <FaChevronDown
                  size={10}
                  className={`text-[var(--muted)] transition-transform duration-200 ${
                    menuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {menuOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-56 bg-[var(--dropdown-bg)] border border-[var(--dropdown-border)] rounded-2xl shadow-2xl overflow-hidden themed-card">
                  <div className="px-4 py-3 border-b border-[var(--divider)] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#8B1E1E]/20 flex items-center justify-center text-sm font-bold text-[#8B1E1E] overflow-hidden shrink-0">
                      {avatar ? (
                        <img src={avatar} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        initials
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        {name}
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)]">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  <div className="py-1">
                    {menuItems.map((item) => {
                      const isActive =
                        pathname === item.href ||
                        pathname.startsWith(`${item.href}/`);
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`flex items-center gap-3 px-4 py-2.5 text-sm transition ${
                            isActive
                              ? "text-[var(--text-primary)] bg-[#8B1E1E]/20"
                              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]"
                          }`}
                        >
                          {item.icon}
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>

                  <div className="border-t border-[var(--divider)] py-1">
                    <button
                      type="button"
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-[var(--surface)] w-full transition"
                    >
                      <FaSignOutAlt size={14} />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Global Board island */}
            <Link
              href="/leaderboard"
              className={`flex items-center gap-1.5 py-2 px-3 rounded-full text-sm font-medium transition-all ${
                pathname.startsWith("/leaderboard")
                  ? "bg-[#8B1E1E] text-white shadow-lg shadow-[#8B1E1E]/20"
                  : "bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <FaTrophy size={13} />
              <span className="hidden sm:inline">Global</span>
            </Link>
          </div>

          {/* Notification — right */}
          <div ref={notifRef} className="relative z-50">
            <button
              type="button"
              title="Notifications"
              onClick={() => {
                setNotifOpen(!notifOpen);
                setMenuOpen(false);
              }}
              className={`relative p-2 rounded-full transition ${
                notifOpen
                  ? "bg-[var(--surface-hover)]"
                  : "hover:bg-[var(--surface)]"
              }`}
            >
              <FaBell size={18} className="text-[var(--muted)]" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#8B1E1E] rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-[var(--dropdown-bg)] border border-[var(--dropdown-border)] rounded-2xl shadow-2xl overflow-hidden themed-card">
                <div className="px-4 py-3 border-b border-[var(--divider)] flex items-center justify-between">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    Notifications
                  </p>
                  {unreadCount > 0 && (
                    <span className="text-xs text-[#8B1E1E] font-medium">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`flex items-start gap-3 px-4 py-3 border-b border-[var(--divider)] transition hover:bg-[var(--surface)] cursor-pointer ${
                          !notif.read ? "bg-[var(--surface)]" : ""
                        }`}
                      >
                        <div className="mt-0.5">{notif.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p
                              className={`text-sm font-medium ${
                                notif.read
                                  ? "text-[var(--text-secondary)]"
                                  : "text-[var(--text-primary)]"
                              }`}
                            >
                              {notif.title}
                            </p>
                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full bg-[#8B1E1E] shrink-0 ml-2" />
                            )}
                          </div>
                          <p className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                            {notif.message}
                          </p>
                          <p className="text-xs text-[var(--muted-strong)] mt-1">
                            {notif.time}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-[var(--muted)] text-sm">
                      No notifications
                    </div>
                  )}
                </div>

                <div className="border-t border-[var(--divider)] px-4 py-2.5">
                  <button
                    type="button"
                    className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition w-full text-center"
                  >
                    Mark all as read
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
