"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import AnimatedAuthBackground from "@/components/auth/AnimatedAuthBackground";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified") === "true";
  const registered = searchParams.get("registered") === "true";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      userType: "user",
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="relative h-screen w-full flex items-center justify-center">
      {/* Animated background */}
      <AnimatedAuthBackground />

      {/* Glassmorphed login card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/[0.07] backdrop-blur-xl border border-white/[0.12] rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src="/invertedLogo.png"
              alt="Nocho"
              className="h-16 w-auto object-contain"
            />
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-white text-center mb-1">
            Welcome Back
          </h1>
          <p className="text-sm text-gray-400 text-center mb-6">
            Enter your credentials to access your exams
          </p>

          {/* Success messages */}
          {verified && (
            <div className="bg-green-500/15 border border-green-500/20 rounded-xl px-4 py-2.5 mb-4">
              <p className="text-green-400 text-sm text-center">
                Email verified successfully! You can now log in.
              </p>
            </div>
          )}
          {registered && !verified && (
            <div className="bg-blue-500/15 border border-blue-500/20 rounded-xl px-4 py-2.5 mb-4">
              <p className="text-blue-400 text-sm text-center">
                Account created! Please check your email to verify before logging in.
              </p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-500/15 border border-red-500/20 rounded-xl px-4 py-2.5 mb-4">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleLogin} className="space-y-4">
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

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs text-[#8B1E1E] hover:text-[#b82e2e] transition"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <FaLock
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#8B1E1E]/60 focus:bg-white/[0.08] transition"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                >
                  {showPassword ? (
                    <FaEyeSlash size={14} />
                  ) : (
                    <FaEye size={14} />
                  )}
                </button>
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
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/[0.08]" />
            <span className="text-xs text-gray-500">OR</span>
            <div className="flex-1 h-px bg-white/[0.08]" />
          </div>

          {/* Sign up link */}
          <p className="text-center text-sm text-gray-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-[#8B1E1E] hover:text-[#b82e2e] transition"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
