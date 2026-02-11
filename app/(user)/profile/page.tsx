"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  FaCamera,
  FaArrowLeft,
  FaPen,
  FaCheck,
  FaTimes,
  FaEnvelope,
  FaCopy,
  FaTrophy,
  FaWallet,
} from "react-icons/fa";
import { FaChartLine, FaBullseye } from "react-icons/fa6";
import { HiAtSymbol } from "react-icons/hi2";
import { GiOpenBook } from "react-icons/gi";
import useProfileStore from "@/stores/useProfileStore";

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;
  const profileStore = useProfileStore();

  // Editable fields — synced to profile store
  const [displayName, setDisplayName] = useState(
    profileStore.displayName || user?.name || ""
  );
  const [nickname, setNickname] = useState(
    profileStore.nickname || user?.nickname || ""
  );
  const [email, setEmail] = useState(user?.email || "");
  const [bio, setBio] = useState(profileStore.bio || "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profileStore.avatar
  );

  // Edit states
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch profile from API on mount
  useEffect(() => {
    if (!session) return;
    const fetchProfile = async () => {
      try {
        const res = await fetch(
          `/api/v1/users/me`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken || ""}`,
            },
          },
        );
        if (!res.ok) return;
        const data = await res.json();
        setDisplayName(data.name || "");
        setNickname(data.nickname || "");
        setEmail(data.email || "");
        setBio(data.bio || "");
        if (data.avatar) setAvatarPreview(data.avatar);
        // Sync to Zustand store for Header
        profileStore.setDisplayName(data.name || "");
        profileStore.setNickname(data.nickname || "");
        profileStore.setBio(data.bio || "");
        if (data.avatar) profileStore.setAvatar(data.avatar);
      } catch {
        // Use session data as fallback
        if (user?.name && !profileStore.displayName) setDisplayName(user.name);
        if (user?.nickname && !profileStore.nickname) setNickname(user.nickname);
        if (user?.email) setEmail(user.email);
      }
    };
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // Stats — will be populated from API later
  const stats = {
    totalEarnings: 0,
    arenasEntered: 0,
    wins: 0,
    winRate: 0,
    avgScore: 0,
    streak: 0,
    rank: 0,
  };

  const recentArenas: { name: string; result: string; prize: number; date: string }[] = [];

  const startEditing = (field: string, currentValue: string) => {
    setEditingField(field);
    setTempValue(currentValue);
  };

  const saveField = async (field: string) => {
    const value = tempValue;

    // Optimistic update
    if (field === "displayName") {
      setDisplayName(value);
      profileStore.setDisplayName(value);
    }
    if (field === "nickname") {
      setNickname(value);
      profileStore.setNickname(value);
    }
    if (field === "bio") {
      setBio(value);
      profileStore.setBio(value);
    }
    setEditingField(null);

    // Persist to API
    const payload: Record<string, string> = {};
    if (field === "displayName") payload.name = value;
    if (field === "nickname") payload.nickname = value;
    if (field === "bio") payload.bio = value;

    try {
      await fetch(`/api/v1/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken || ""}`,
        },
        body: JSON.stringify(payload),
      });
    } catch {
      // Silent fail — data is cached locally via Zustand
    }
  };

  const cancelEdit = () => {
    setEditingField(null);
    setTempValue("");
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        setAvatarPreview(dataUrl);
        profileStore.setAvatar(dataUrl);

        // Persist to API
        try {
          await fetch(`/api/v1/users/me`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.accessToken || ""}`,
            },
            body: JSON.stringify({ avatar: dataUrl }),
          });
        } catch {
          // Silent fail — cached locally
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const copyProfileLink = () => {
    navigator.clipboard.writeText(`nocho.ng/@${nickname}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="text-[var(--text-primary)] pb-20">
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--text-primary)] transition mb-6"
      >
        <FaArrowLeft size={12} />
        Back to Dashboard
      </Link>

      <div className="max-w-3xl mx-auto">
        {/* ─── PROFILE HEADER ─── */}
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 themed-card">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-[#8B1E1E]/20 flex items-center justify-center border-2 border-[#8B1E1E]/30">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-[#8B1E1E]">
                    {initials}
                  </span>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-[#8B1E1E] rounded-full flex items-center justify-center text-white shadow-lg hover:bg-[#a02424] transition"
              >
                <FaCamera size={12} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              {/* Display Name */}
              <div className="flex items-center justify-center sm:justify-start gap-2">
                {editingField === "displayName" ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="bg-[var(--input-bg)] border border-[var(--surface-border)] rounded-lg px-3 py-1.5 text-lg font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#8B1E1E]/60"
                      autoFocus
                    />
                    <button
                      onClick={() => saveField("displayName")}
                      className="p-1.5 text-green-500 hover:bg-green-500/10 rounded-lg transition"
                    >
                      <FaCheck size={12} />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                ) : (
                  <>
                    <h1 className="text-xl font-bold">{displayName}</h1>
                    <button
                      onClick={() => startEditing("displayName", displayName)}
                      className="p-1.5 text-[var(--muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] rounded-lg transition"
                    >
                      <FaPen size={10} />
                    </button>
                  </>
                )}
              </div>

              {/* Nickname */}
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                {editingField === "nickname" ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-[var(--input-bg)] border border-[var(--surface-border)] rounded-lg px-3 py-1">
                      <HiAtSymbol size={14} className="text-[var(--muted)]" />
                      <input
                        type="text"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        className="bg-transparent text-sm text-[var(--text-primary)] focus:outline-none ml-1 w-32"
                        autoFocus
                      />
                    </div>
                    <button
                      onClick={() => saveField("nickname")}
                      className="p-1.5 text-green-500 hover:bg-green-500/10 rounded-lg transition"
                    >
                      <FaCheck size={12} />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-sm text-[var(--muted)]">
                      @{nickname}
                    </span>
                    <button
                      onClick={() => startEditing("nickname", nickname)}
                      className="p-1 text-[var(--muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] rounded-lg transition"
                    >
                      <FaPen size={8} />
                    </button>
                  </>
                )}
              </div>

              {/* Email */}
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                <FaEnvelope size={12} className="text-[var(--muted)]" />
                <span className="text-sm text-[var(--text-secondary)]">
                  {email}
                </span>
                <span className="text-xs bg-green-500/15 text-green-500 px-2 py-0.5 rounded-full">
                  Verified
                </span>
              </div>

              {/* Bio */}
              <div className="mt-3">
                {editingField === "bio" ? (
                  <div className="flex items-start gap-2">
                    <textarea
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      rows={2}
                      maxLength={120}
                      className="flex-1 bg-[var(--input-bg)] border border-[var(--surface-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#8B1E1E]/60 resize-none"
                      autoFocus
                    />
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => saveField("bio")}
                        className="p-1.5 text-green-500 hover:bg-green-500/10 rounded-lg transition"
                      >
                        <FaCheck size={12} />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition"
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <p className="text-sm text-[var(--muted)] italic">
                      {bio || "No bio yet"}
                    </p>
                    <button
                      onClick={() => startEditing("bio", bio)}
                      className="p-1 text-[var(--muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] rounded-lg transition shrink-0"
                    >
                      <FaPen size={8} />
                    </button>
                  </div>
                )}
              </div>

              {/* Profile link */}
              <button
                onClick={copyProfileLink}
                className="mt-3 inline-flex items-center gap-2 text-xs text-[var(--muted)] hover:text-[var(--text-primary)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] px-3 py-1.5 rounded-full transition"
              >
                <FaCopy size={10} />
                {copied ? "Copied!" : `nocho.ng/@${nickname}`}
              </button>
            </div>
          </div>
        </div>

        {/* ─── STATS GRID ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          {[
            {
              icon: <FaWallet size={14} className="text-green-500" />,
              label: "Earnings",
              value: `₦${stats.totalEarnings.toLocaleString()}`,
            },
            {
              icon: <GiOpenBook size={14} className="text-[#8B1E1E]" />,
              label: "Arenas",
              value: stats.arenasEntered,
            },
            {
              icon: <FaTrophy size={14} className="text-yellow-400" />,
              label: "Wins",
              value: stats.wins,
            },
            {
              icon: <FaChartLine size={14} className="text-blue-400" />,
              label: "Win Rate",
              value: `${stats.winRate}%`,
            },
            {
              icon: <FaBullseye size={14} className="text-orange-400" />,
              label: "Avg Score",
              value: `${stats.avgScore}%`,
            },
            {
              icon: (
                <span className="text-sm">🔥</span>
              ),
              label: "Streak",
              value: `${stats.streak} days`,
            },
            {
              icon: (
                <span className="text-yellow-400 font-bold text-sm">#</span>
              ),
              label: "Global Rank",
              value: `#${stats.rank}`,
            },
            {
              icon: (
                <span className="text-green-400 font-bold text-sm">✓</span>
              ),
              label: "Verified",
              value: "Yes",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4 themed-card"
            >
              <div className="flex items-center gap-2 mb-1">
                {stat.icon}
                <span className="text-xs text-[var(--muted)]">
                  {stat.label}
                </span>
              </div>
              <p className="text-lg font-bold text-[var(--text-primary)]">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* ─── RECENT ARENA RESULTS ─── */}
        <div className="mt-5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl themed-card overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--divider)]">
            <h3 className="font-semibold text-[var(--text-primary)]">
              Recent Arena Results
            </h3>
          </div>
          <div className="divide-y divide-[var(--divider)]">
            {recentArenas.length > 0 ? (
              recentArenas.map((arena) => (
                <div
                  key={arena.name}
                  className="flex items-center justify-between px-5 py-3.5"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {arena.name}
                    </p>
                    <p className="text-xs text-[var(--muted)] mt-0.5">
                      {arena.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        arena.result === "1st"
                          ? "bg-yellow-400/15 text-yellow-400"
                          : arena.result === "2nd"
                            ? "bg-gray-300/15 text-gray-300"
                            : "bg-orange-400/15 text-orange-400"
                      }`}
                    >
                      {arena.result}
                    </span>
                    <p className="text-sm font-bold text-green-500 mt-1">
                      +₦{arena.prize.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center text-sm text-[var(--muted)]">
                No arena results yet. Enter an arena to get started!
              </div>
            )}
          </div>
        </div>

        {/* ─── LINKED ACCOUNTS ─── */}
        <div className="mt-5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl themed-card overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--divider)]">
            <h3 className="font-semibold text-[var(--text-primary)]">
              Linked Accounts
            </h3>
          </div>
          <div className="divide-y divide-[var(--divider)]">
            <div className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[var(--surface)] rounded-lg flex items-center justify-center">
                  <FaEnvelope size={14} className="text-[var(--muted)]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    Email
                  </p>
                  <p className="text-xs text-[var(--muted)]">{email}</p>
                </div>
              </div>
              <span className="text-xs bg-green-500/15 text-green-500 px-2 py-0.5 rounded-full">
                Connected
              </span>
            </div>

            <div className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[var(--surface)] rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-[var(--muted)]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    Google
                  </p>
                  <p className="text-xs text-[var(--muted)]">Not connected</p>
                </div>
              </div>
              <button className="text-xs text-[#8B1E1E] hover:text-[#b82e2e] font-medium px-3 py-1.5 bg-[#8B1E1E]/10 hover:bg-[#8B1E1E]/15 rounded-full transition">
                Connect
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
