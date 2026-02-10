"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaArrowLeft,
  FaBell,
  FaLock,
  FaSignOutAlt,
  FaShieldAlt,
  FaTrash,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { FaPalette } from "react-icons/fa6";
import { HiOutlineDevicePhoneMobile } from "react-icons/hi2";
import useThemeStore from "@/stores/useThemeStore";

export default function SettingsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { theme, toggleTheme } = useThemeStore();

  // Mock toggle states
  const [notifications, setNotifications] = useState({
    examReminders: true,
    results: true,
    promotions: false,
    walletAlerts: true,
  });
  const [privacy, setPrivacy] = useState({
    showProfile: true,
    showEarnings: false,
    showOnLeaderboard: true,
  });

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) return;
    // TODO: API call
    setShowPasswordForm(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const ToggleSwitch = ({
    checked,
    onChange,
    label,
  }: {
    checked: boolean;
    onChange: () => void;
    label: string;
  }) => (
    <button
      type="button"
      onClick={onChange}
      aria-label={label}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        checked ? "bg-[#8B1E1E]" : "bg-[var(--surface-border)]"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${
          checked ? "translate-x-5" : ""
        }`}
      />
    </button>
  );

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

      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">Settings</h1>
        <p className="text-sm text-[var(--muted)] mb-6">
          Manage your account preferences and security.
        </p>

        {/* ─── APPEARANCE ─── */}
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl themed-card overflow-hidden mb-5">
          <div className="px-5 py-4 border-b border-[var(--divider)] flex items-center gap-3">
            <FaPalette size={16} className="text-[#8B1E1E]" />
            <h3 className="font-semibold">Appearance</h3>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  Theme
                </p>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Switch between dark and light mode
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[var(--muted)] capitalize">
                  {theme}
                </span>
                <ToggleSwitch
                  checked={theme === "light"}
                  onChange={toggleTheme}
                  label="Toggle theme"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ─── NOTIFICATIONS ─── */}
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl themed-card overflow-hidden mb-5">
          <div className="px-5 py-4 border-b border-[var(--divider)] flex items-center gap-3">
            <FaBell size={16} className="text-orange-400" />
            <h3 className="font-semibold">Notifications</h3>
          </div>
          <div className="divide-y divide-[var(--divider)]">
            {[
              {
                key: "examReminders" as const,
                label: "Exam Reminders",
                desc: "Get notified before arenas you registered for start",
              },
              {
                key: "results" as const,
                label: "Results & Rankings",
                desc: "Receive notifications when arena results are published",
              },
              {
                key: "walletAlerts" as const,
                label: "Wallet Alerts",
                desc: "Deposit confirmations and withdrawal updates",
              },
              {
                key: "promotions" as const,
                label: "Promotions & Updates",
                desc: "News about new arenas, features, and platform updates",
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between px-5 py-4"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {item.label}
                  </p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    {item.desc}
                  </p>
                </div>
                <ToggleSwitch
                  checked={notifications[item.key]}
                  onChange={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      [item.key]: !prev[item.key],
                    }))
                  }
                  label={`Toggle ${item.label}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ─── PRIVACY ─── */}
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl themed-card overflow-hidden mb-5">
          <div className="px-5 py-4 border-b border-[var(--divider)] flex items-center gap-3">
            <FaShieldAlt size={16} className="text-blue-400" />
            <h3 className="font-semibold">Privacy</h3>
          </div>
          <div className="divide-y divide-[var(--divider)]">
            {[
              {
                key: "showProfile" as const,
                label: "Public Profile",
                desc: "Allow others to see your profile page",
              },
              {
                key: "showEarnings" as const,
                label: "Show Earnings",
                desc: "Display your total earnings on your profile",
              },
              {
                key: "showOnLeaderboard" as const,
                label: "Leaderboard Visibility",
                desc: "Appear on global and arena leaderboards",
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between px-5 py-4"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {item.label}
                  </p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    {item.desc}
                  </p>
                </div>
                <ToggleSwitch
                  checked={privacy[item.key]}
                  onChange={() =>
                    setPrivacy((prev) => ({
                      ...prev,
                      [item.key]: !prev[item.key],
                    }))
                  }
                  label={`Toggle ${item.label}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ─── SECURITY ─── */}
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl themed-card overflow-hidden mb-5">
          <div className="px-5 py-4 border-b border-[var(--divider)] flex items-center gap-3">
            <FaLock size={16} className="text-green-500" />
            <h3 className="font-semibold">Security</h3>
          </div>
          <div className="divide-y divide-[var(--divider)]">
            {/* Change Password */}
            <div className="px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    Change Password
                  </p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    Update your account password
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="text-xs text-[#8B1E1E] hover:text-[#b82e2e] font-medium px-3 py-1.5 bg-[#8B1E1E]/10 hover:bg-[#8B1E1E]/15 rounded-full transition"
                >
                  {showPasswordForm ? "Cancel" : "Change"}
                </button>
              </div>

              {showPasswordForm && (
                <div className="mt-4 space-y-3">
                  <div className="relative">
                    <input
                      type={showPasswords ? "text" : "password"}
                      placeholder="Current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-[var(--input-bg)] border border-[var(--surface-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[#8B1E1E]/60"
                    />
                  </div>
                  <input
                    type={showPasswords ? "text" : "password"}
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[var(--input-bg)] border border-[var(--surface-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[#8B1E1E]/60"
                  />
                  <div className="relative">
                    <input
                      type={showPasswords ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-[var(--input-bg)] border border-[var(--surface-border)] rounded-xl px-4 py-2.5 pr-10 text-sm text-[var(--text-primary)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[#8B1E1E]/60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text-primary)]"
                    >
                      {showPasswords ? (
                        <FaEyeSlash size={14} />
                      ) : (
                        <FaEye size={14} />
                      )}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handlePasswordChange}
                    disabled={
                      !currentPassword || !newPassword || !confirmPassword
                    }
                    className="w-full py-2.5 bg-[#8B1E1E] text-white text-sm font-semibold rounded-xl hover:bg-[#a02424] transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Update Password
                  </button>
                </div>
              )}
            </div>

            {/* Active Sessions */}
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  Active Sessions
                </p>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Manage devices logged into your account
                </p>
              </div>
              <div className="flex items-center gap-2">
                <HiOutlineDevicePhoneMobile
                  size={16}
                  className="text-green-500"
                />
                <span className="text-xs text-[var(--muted)]">
                  1 device
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── ACCOUNT ACTIONS ─── */}
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl themed-card overflow-hidden mb-5">
          <div className="divide-y divide-[var(--divider)]">
            {/* Log out */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 px-5 py-4 w-full text-left hover:bg-[var(--surface)] transition"
            >
              <FaSignOutAlt size={16} className="text-[var(--muted)]" />
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  Log Out
                </p>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Sign out of your current session
                </p>
              </div>
            </button>

            {/* Delete account */}
            <div className="px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaTrash size={14} className="text-red-400" />
                  <div>
                    <p className="text-sm font-medium text-red-400">
                      Delete Account
                    </p>
                    <p className="text-xs text-[var(--muted)] mt-0.5">
                      Permanently delete your account and all data
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                  className="text-xs text-red-400 hover:text-red-300 font-medium px-3 py-1.5 bg-red-400/10 hover:bg-red-400/15 rounded-full transition"
                >
                  Delete
                </button>
              </div>

              {showDeleteConfirm && (
                <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <p className="text-sm text-red-400 mb-3">
                    Are you sure? This action cannot be undone. All your data,
                    wallet balance, and arena history will be permanently deleted.
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 py-2 text-sm font-medium text-[var(--text-primary)] bg-[var(--surface)] rounded-xl hover:bg-[var(--surface-hover)] transition"
                    >
                      Cancel
                    </button>
                    <button type="button" className="flex-1 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition">
                      Yes, Delete My Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Account info */}
        <div className="text-center text-xs text-[var(--muted)] mt-8 space-y-1">
          <p>
            Logged in as{" "}
            <span className="text-[var(--text-secondary)]">
              {session?.user?.email || "guest"}
            </span>
          </p>
          <p>Nocho v1.0.0</p>
        </div>
      </div>
    </div>
  );
}
