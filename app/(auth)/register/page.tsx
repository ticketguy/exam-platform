"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { HiAtSymbol } from "react-icons/hi2";
import AnimatedAuthBackground from "@/components/auth/AnimatedAuthBackground";

const RegisterPage = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          nickname,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Registration failed");
        setLoading(false);
        return;
      }

      setLoading(false);
      setSuccess(
        "Account created! Please check your email to verify your account before logging in."
      );

      // Redirect to login after a delay
      setTimeout(() => {
        router.push("/login?registered=true");
      }, 3000);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center py-8">
      {/* Animated background */}
      <AnimatedAuthBackground />

      {/* Glassmorphed register card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/[0.07] backdrop-blur-xl border border-white/[0.12] rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-5">
            <img
              src="/invertedLogo.png"
              alt="Nocho"
              className="h-16 w-auto object-contain"
            />
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-white text-center mb-1">
            Welcome to Nocho
          </h1>
          <p className="text-sm text-gray-400 text-center mb-6">
            Create an account to get started
          </p>

          {/* Success message */}
          {success && (
            <div className="bg-green-500/15 border border-green-500/20 rounded-xl px-4 py-2.5 mb-4">
              <p className="text-green-400 text-sm text-center">{success}</p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-500/15 border border-red-500/20 rounded-xl px-4 py-2.5 mb-4">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Register form */}
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name & Nickname row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 block">
                  Full Name
                </label>
                <div className="relative">
                  <FaUser
                    size={12}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl pl-9 pr-3 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#8B1E1E]/60 focus:bg-white/[0.08] transition"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 block">
                  Nickname
                </label>
                <div className="relative">
                  <HiAtSymbol
                    size={14}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <input
                    type="text"
                    placeholder="AceBrain"
                    className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl pl-9 pr-3 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#8B1E1E]/60 focus:bg-white/[0.08] transition"
                    required
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 block">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#8B1E1E]/60 focus:bg-white/[0.08] transition"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password & Confirm row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 block">
                  Password
                </label>
                <div className="relative">
                  <FaLock
                    size={12}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl pl-9 pr-3 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#8B1E1E]/60 focus:bg-white/[0.08] transition"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 block">
                  Confirm
                </label>
                <div className="relative">
                  <FaLock
                    size={12}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm"
                    className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl pl-9 pr-9 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#8B1E1E]/60 focus:bg-white/[0.08] transition"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                  >
                    {showPassword ? (
                      <FaEyeSlash size={12} />
                    ) : (
                      <FaEye size={12} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 bg-gradient-to-r from-[#8B1E1E] to-[#6b1717] text-white text-sm font-semibold rounded-xl hover:from-[#a02424] hover:to-[#7a1c1c] transition-all shadow-lg shadow-[#8B1E1E]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/[0.08]" />
            <span className="text-xs text-gray-500">OR</span>
            <div className="flex-1 h-px bg-white/[0.08]" />
          </div>

          {/* Login link */}
          <p className="text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#8B1E1E] hover:text-[#b82e2e] transition"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
