"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const AdminLoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await signIn("credentials", {
      email,
      password,
      userType: "admin", // 👈 Specifies admin login
      redirect: false,
    });

    console.log("ADMIN LOGIN RESPONSE:", res);

    if (res?.error) {
      setError("Invalid admin credentials");
      return;
    }

    // Redirect to admin dashboard on successful login
    router.push("/idokosafehouse");
  };

  return (
    <div className="h-screen w-full flex items-center justify-center px-7 md:px-40 max-w-225 mx-auto">
      <div className="bg-white py-10 px-5 text-center rounded-md shadow-md w-full">
        {/* Logo */}
        <div className="relative w-20 h-20 mx-auto mb-4 bg-[#8B2E2E] rounded-full flex items-center justify-center overflow-hidden">
          <img src="/invertedLogo.png" alt="Logo" className="object-contain w-full h-full" />
        </div>

        <h1 className="text-[30px] font-semibold">Admin Portal</h1>
        <p className="mb-5">Enter your admin credentials to continue</p>

        {/* Log in form */}
        <form onSubmit={handleLogin}>
          {error && (
            <p className="text-red-500 text-sm text-center mb-2">{error}</p>
          )}

          <div className="flex flex-col gap-4 mb-5 px-4">
            <div className="flex flex-col gap-1 text-left">
              <label htmlFor="email">Email Address</label>
              <input
                type="text"
                placeholder="Enter Admin Email"
                className="bg-[#d3d3d3c2] rounded-md px-2 py-1"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1 text-left">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                placeholder="Enter Admin Password"
                className="bg-[#d3d3d3c2] rounded-md px-2 py-1"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button className="mt-5 w-full py-2 redBg text-white rounded-lg cursor-pointer">
              Login to Admin Portal
            </button>
          </div>
        </form>

        <p className="text-sm text-gray-500 mt-4">
          Admin access only
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;