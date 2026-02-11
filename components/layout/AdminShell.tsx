"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  FaBars,
  FaMoneyBillWave,
  FaClipboardList,
  FaCog,
  FaExchangeAlt,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { GiOpenBook } from "react-icons/gi";

type AdminSession = {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string;
};

const AdminShell = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname() || "";

  // Extract admin info
  const admin =
    status === "authenticated" ? (session?.user as AdminSession) : undefined;
  const adminName = admin?.name || "Admin";
  const adminEmail = admin?.email || "admin@example.com";

  // Admin navigation links
  const links = [
    { name: "Dashboard", icon: <MdDashboard />, href: "/idokosafehouse" },
    { name: "Exams", icon: <GiOpenBook />, href: "/idokosafehouse/exams" },
    { name: "Deposits", icon: <FaMoneyBillWave />, href: "/idokosafehouse/deposits" },
    {
      name: "Withdrawals",
      icon: <FaClipboardList />,
      href: "/idokosafehouse/withdrawals",
    },
    {
      name: "Transactions",
      icon: <FaExchangeAlt />,
      href: "/idokosafehouse/transactions",
    },
  ];

  const settings = {
    name: "Settings",
    icon: <FaCog />,
    href: "/idokosafehouse/settings",
  };

  const getPageTitle = () => {
    if (pathname === "/idokosafehouse") return "Admin Dashboard";
    if (pathname.startsWith("/idokosafehouse/exams")) return "Manage Exams";
    if (pathname.startsWith("/idokosafehouse/deposits")) return "Manage Deposits";
    if (pathname.startsWith("/idokosafehouse/withdrawals")) return "Manage Withdrawals";
    if (pathname.startsWith("/idokosafehouse/transactions")) return "Transactions";
    if (pathname.startsWith("/idokosafehouse/settings")) return "Settings";
    return "Admin Panel";
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/idokosafehouse/login" });
  };

  return (
    <div className="flex h-screen w-full">
      {/* SideNav */}
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
              // Special case for Dashboard - only active on exact match
              const isActive =
                link.href === "/idokosafehouse"
                  ? pathname === "/idokosafehouse" // Exact match for dashboard
                  : pathname === link.href ||
                    pathname.startsWith(`${link.href}/`); // Normal check for others

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
                    ? "bg-[#8B1E1E] text-white font-semibold shadow-lg"
                    : "text-gray-300 hover:bg-[#8b1e1e48] hover:text-white"
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

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 py-3 px-3 rounded-lg transition-all text-gray-300 hover:bg-red-600 hover:text-white mt-2"
            >
              <span className="text-lg">
                <FaSignOutAlt />
              </span>
              <span>Logout</span>
            </button>
          </nav>

          {/* Admin info */}
          <div className="w-full flex items-center gap-3 p-4 border-t border-gray-700 mt-auto">
            <div className="w-10 h-10 shrink-0 bg-[#8B1E1E] rounded-full flex items-center justify-center">
              <FaUser className="text-white" size={20} />
            </div>
            <div className="flex flex-col text-sm overflow-hidden">
              <span className="font-semibold truncate">{adminName}</span>
              <span className="text-gray-400 text-xs truncate">
                {adminEmail}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* TopNav */}
        <header className="w-full flex items-center gap-5 bg-black text-white p-4 border border-gray-700">
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden hover:bg-gray-700 p-2 rounded transition"
          >
            <FaBars size={24} />
          </button>
          <h1 className="font-bold text-lg">{getPageTitle()}</h1>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden h-full p-6 bg-black text-white">
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

export default AdminShell;
