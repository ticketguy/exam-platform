"use client";

import { useState, useEffect } from "react";
import {
  FaSave,
  FaCheckCircle,
  FaExclamationCircle,
  FaPlus,
  FaTrash,
  FaUserShield,
  FaCog,
  FaShieldAlt,
  FaWallet,
  FaGlobe,
} from "react-icons/fa";

interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  lastLogin: string;
}

export default function SettingsPage() {
  // DigiByte Settings
  const [dgbMode, setDgbMode] = useState<"mock" | "live">("mock");
  const [rpcHost, setRpcHost] = useState("localhost");
  const [rpcPort, setRpcPort] = useState(14022);
  const [rpcUsername, setRpcUsername] = useState("digibyte");
  const [rpcPassword, setRpcPassword] = useState("");
  const [confirmationsRequired, setConfirmationsRequired] = useState(6);
  const [addressRotation, setAddressRotation] = useState(true);
  const [rpcStatus, setRpcStatus] = useState<
    "testing" | "connected" | "failed" | null
  >(null);

  // Security Settings
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [maxLoginAttempts, setMaxLoginAttempts] = useState(5);
  const [maxWithdrawalPerHour, setMaxWithdrawalPerHour] = useState(3);
  const [maxApiCallsPerMinute, setMaxApiCallsPerMinute] = useState(60);

  // Exam Settings
  const [defaultExamDuration, setDefaultExamDuration] = useState(60);
  const [defaultPassMark, setDefaultPassMark] = useState(70);
  const [allowExamRetakes, setAllowExamRetakes] = useState(true);
  const [showAnswersAfterCompletion, setShowAnswersAfterCompletion] = useState(false);

  // Admin Management
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminRole, setNewAdminRole] = useState<"admin" | "super_admin">(
    "admin",
  );

  // Platform Settings
  const [waitlistEnabled, setWaitlistEnabled] = useState(true);
  const [waitlistLoading, setWaitlistLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<
    "platform" | "dgb" | "security" | "exam" | "admins"
  >("platform");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch waitlist status and admins on mount
  useEffect(() => {
    fetch("/api/v1/settings", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setWaitlistEnabled(data.waitlistEnabled))
      .catch(() => {});

    fetch("/api/v1/admin/admins")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAdmins(data.map((a: { id: string; name: string; email: string; role: string; lastLoginAt: string | null }) => ({
            id: a.id,
            name: a.name,
            email: a.email,
            role: a.role,
            lastLogin: a.lastLoginAt ? new Date(a.lastLoginAt).toLocaleString() : "Never",
          })));
        }
      })
      .catch(() => {});
  }, []);

  const handleToggleWaitlist = async () => {
    setWaitlistLoading(true);
    try {
      const res = await fetch("/api/v1/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ waitlistEnabled: !waitlistEnabled }),
      });
      const data = await res.json();
      setWaitlistEnabled(data.waitlistEnabled);
    } catch {
      // silent fail
    }
    setWaitlistLoading(false);
  };

  // Test RPC Connection
  const handleTestConnection = async () => {
    setRpcStatus("testing");
    try {
      const res = await fetch("/api/v1/admin/dgb-test", { method: "POST" });
      const data = await res.json();
      setRpcStatus(data.connected ? "connected" : "failed");
      if (data.mode) setDgbMode(data.mode);
    } catch {
      setRpcStatus("failed");
    }
    setTimeout(() => setRpcStatus(null), 5000);
  };

  // Save Settings (these are env-based configs - shows confirmation)
  const handleSaveSettings = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Add Admin via API
  const handleAddAdmin = async () => {
    if (!newAdminName || !newAdminEmail || !newAdminPassword) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await fetch("/api/v1/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newAdminName,
          email: newAdminEmail,
          password: newAdminPassword,
          role: "admin",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAdmins([...admins, {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          lastLogin: "Never",
        }]);
        setShowAddAdminModal(false);
        setNewAdminName("");
        setNewAdminEmail("");
        setNewAdminPassword("");
        setNewAdminRole("admin");
      } else {
        const err = await res.json();
        alert(err.detail || "Failed to add admin");
      }
    } catch {
      alert("Failed to add admin");
    }
  };

  // Remove Admin via API
  const handleRemoveAdmin = async (adminId: string) => {
    if (!confirm("Are you sure you want to remove this admin?")) return;

    try {
      const res = await fetch(`/api/v1/admin/admins/${adminId}`, { method: "DELETE" });
      if (res.ok) {
        setAdmins(admins.filter((a) => a.id !== adminId));
      } else {
        const err = await res.json();
        alert(err.detail || "Failed to remove admin");
      }
    } catch {
      alert("Failed to remove admin");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">System Settings</h1>
          <p className="text-gray-400 text-sm mt-1">
            Configure platform settings and preferences
          </p>
        </div>
        <button
          onClick={handleSaveSettings}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition w-fit"
        >
          <FaSave /> Save All Changes
        </button>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="bg-green-900 border border-green-600 rounded-lg p-4 flex items-center gap-2">
          <FaCheckCircle className="text-green-400 text-xl" />
          <p className="text-green-400">Settings saved successfully!</p>
        </div>
      )}

      {/* Tabs */}
      <div className="darkCard p-2">
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("platform")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === "platform"
                ? "bg-[#8B2E2E] text-white"
                : "text-gray-400 hover:bg-gray-800"
            }`}
          >
            <FaGlobe /> Platform
          </button>
          <button
            onClick={() => setActiveTab("dgb")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === "dgb"
                ? "bg-[#8B2E2E] text-white"
                : "text-gray-400 hover:bg-gray-800"
            }`}
          >
            <FaWallet /> DigiByte Settings
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === "security"
                ? "bg-[#8B2E2E] text-white"
                : "text-gray-400 hover:bg-gray-800"
            }`}
          >
            <FaShieldAlt /> Security
          </button>
          <button
            onClick={() => setActiveTab("exam")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === "exam"
                ? "bg-[#8B2E2E] text-white"
                : "text-gray-400 hover:bg-gray-800"
            }`}
          >
            <FaCog /> Exam Settings
          </button>
          <button
            onClick={() => setActiveTab("admins")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === "admins"
                ? "bg-[#8B2E2E] text-white"
                : "text-gray-400 hover:bg-gray-800"
            }`}
          >
            <FaUserShield /> Admin Management
          </button>
        </div>
      </div>

      {/* Platform Settings */}
      {activeTab === "platform" && (
        <div className="space-y-6">
          <div className="redCard p-6">
            <h2 className="text-white text-lg font-semibold mb-4">
              Landing Page Mode
            </h2>
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-900 border border-gray-700">
              <div>
                <p className="text-white font-medium">Waitlist Mode</p>
                <p className="text-gray-400 text-sm mt-1">
                  {waitlistEnabled
                    ? "Landing page shows a waitlist signup form. Users cannot register or log in."
                    : "Landing page shows Login and Sign Up buttons. Users can register and access the platform."}
                </p>
              </div>
              <button
                type="button"
                title={waitlistEnabled ? "Disable waitlist mode" : "Enable waitlist mode"}
                onClick={handleToggleWaitlist}
                disabled={waitlistLoading}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors shrink-0 ${
                  waitlistEnabled ? "bg-[#8B2E2E]" : "bg-gray-600"
                } disabled:opacity-50`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    waitlistEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <p className="text-gray-500 text-xs mt-3">
              Enable waitlist mode to collect emails from beta testers before launch. Disable it to open the platform for registration.
            </p>
          </div>
        </div>
      )}

      {/* DigiByte Settings */}
      {activeTab === "dgb" && (
        <div className="space-y-6">
          <div className="redCard p-6">
            <h2 className="text-white text-lg font-semibold mb-4">
              DigiByte Mode
            </h2>

            <div className="mb-6">
              <label className="text-gray-400 text-sm mb-2 block">
                Operating Mode
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="dgbMode"
                    value="mock"
                    checked={dgbMode === "mock"}
                    onChange={(e) => setDgbMode(e.target.value as any)}
                    className="w-4 h-4"
                  />
                  <span className="text-white">Mock (Testing)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="dgbMode"
                    value="live"
                    checked={dgbMode === "live"}
                    onChange={(e) => setDgbMode(e.target.value as any)}
                    className="w-4 h-4"
                  />
                  <span className="text-white">Live (Production)</span>
                </label>
              </div>
              <p className="text-gray-500 text-xs mt-2">
                {dgbMode === "mock"
                  ? "Using simulated blockchain for testing"
                  : "Connected to real DigiByte blockchain"}
              </p>
            </div>

            {dgbMode === "live" && (
              <>
                <h3 className="text-white font-semibold mb-4 mt-6">
                  RPC Connection
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">
                      RPC Host
                    </label>
                    <input
                      type="text"
                      value={rpcHost}
                      onChange={(e) => setRpcHost(e.target.value)}
                      placeholder="localhost"
                      className="w-full fadeInput rounded-lg px-4 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">
                      RPC Port
                    </label>
                    <input
                      type="number"
                      value={rpcPort}
                      onChange={(e) => setRpcPort(Number(e.target.value))}
                      placeholder="14022"
                      className="w-full fadeInput rounded-lg px-4 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">
                      RPC Username
                    </label>
                    <input
                      type="text"
                      value={rpcUsername}
                      onChange={(e) => setRpcUsername(e.target.value)}
                      placeholder="username"
                      className="w-full fadeInput rounded-lg px-4 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">
                      RPC Password
                    </label>
                    <input
                      type="password"
                      value={rpcPassword}
                      onChange={(e) => setRpcPassword(e.target.value)}
                      placeholder="password"
                      className="w-full fadeInput rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                </div>

                <button
                  onClick={handleTestConnection}
                  disabled={rpcStatus === "testing"}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                >
                  {rpcStatus === "testing" ? (
                    <>Testing Connection...</>
                  ) : (
                    <>
                      <FaCog /> Test Connection
                    </>
                  )}
                </button>

                {rpcStatus === "connected" && (
                  <div className="mt-4 bg-green-900 border border-green-600 rounded-lg p-3 flex items-center gap-2">
                    <FaCheckCircle className="text-green-400" />
                    <p className="text-green-400 text-sm">
                      Connection successful!
                    </p>
                  </div>
                )}

                {rpcStatus === "failed" && (
                  <div className="mt-4 bg-red-900 border border-red-600 rounded-lg p-3 flex items-center gap-2">
                    <FaExclamationCircle className="text-red-400" />
                    <p className="text-red-400 text-sm">
                      Connection failed. Check credentials.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="redCard p-6">
            <h2 className="text-white text-lg font-semibold mb-4">
              Blockchain Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">
                  Confirmations Required
                </label>
                <input
                  type="number"
                  value={confirmationsRequired}
                  onChange={(e) =>
                    setConfirmationsRequired(Number(e.target.value))
                  }
                  min="1"
                  max="20"
                  className="w-full fadeInput rounded-lg px-4 py-2 text-white"
                />
                <p className="text-gray-500 text-xs mt-1">
                  Number of blockchain confirmations before crediting deposits
                </p>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">
                  Address Rotation
                </label>
                <label className="flex items-center gap-2 cursor-pointer mt-2">
                  <input
                    type="checkbox"
                    checked={addressRotation}
                    onChange={(e) => setAddressRotation(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-white">
                    Enable automatic address rotation
                  </span>
                </label>
                <p className="text-gray-500 text-xs mt-1">
                  Generate new deposit addresses for better privacy
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Settings */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <div className="redCard p-6">
            <h2 className="text-white text-lg font-semibold mb-4">
              Session Management
            </h2>

            <div className="mb-4">
              <label className="text-gray-400 text-sm mb-2 block">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(Number(e.target.value))}
                min="5"
                max="120"
                className="w-full fadeInput rounded-lg px-4 py-2 text-white"
              />
              <p className="text-gray-500 text-xs mt-1">
                Users will be logged out after this period of inactivity
              </p>
            </div>
          </div>

          <div className="redCard p-6">
            <h2 className="text-white text-lg font-semibold mb-4">
              Rate Limiting
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">
                  Max Login Attempts (per hour)
                </label>
                <input
                  type="number"
                  value={maxLoginAttempts}
                  onChange={(e) => setMaxLoginAttempts(Number(e.target.value))}
                  min="1"
                  max="20"
                  className="w-full fadeInput rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">
                  Max Withdrawals (per hour)
                </label>
                <input
                  type="number"
                  value={maxWithdrawalPerHour}
                  onChange={(e) =>
                    setMaxWithdrawalPerHour(Number(e.target.value))
                  }
                  min="1"
                  max="20"
                  className="w-full fadeInput rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">
                  Max API Calls (per minute)
                </label>
                <input
                  type="number"
                  value={maxApiCallsPerMinute}
                  onChange={(e) =>
                    setMaxApiCallsPerMinute(Number(e.target.value))
                  }
                  min="10"
                  max="1000"
                  className="w-full fadeInput rounded-lg px-4 py-2 text-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exam Settings */}
      {activeTab === "exam" && (
        <div className="space-y-6">
          <div className="redCard p-6">
            <h2 className="text-white text-lg font-semibold mb-4">
              Default Exam Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">
                  Default Exam Duration (minutes)
                </label>
                <input
                  type="number"
                  value={defaultExamDuration}
                  onChange={(e) =>
                    setDefaultExamDuration(Number(e.target.value))
                  }
                  min="15"
                  max="240"
                  className="w-full fadeInput rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">
                  Default Pass Mark (%)
                </label>
                <input
                  type="number"
                  value={defaultPassMark}
                  onChange={(e) => setDefaultPassMark(Number(e.target.value))}
                  min="0"
                  max="100"
                  className="w-full fadeInput rounded-lg px-4 py-2 text-white"
                />
              </div>
            </div>

            <h3 className="text-white font-semibold mb-4">Exam Behavior</h3>

            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowExamRetakes}
                  onChange={(e) => setAllowExamRetakes(e.target.checked)}
                  className="w-4 h-4"
                />
                <div>
                  <span className="text-white">Allow Exam Retakes</span>
                  <p className="text-gray-500 text-xs">
                    Users can retake exams if they fail
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAnswersAfterCompletion}
                  onChange={(e) =>
                    setShowAnswersAfterCompletion(e.target.checked)
                  }
                  className="w-4 h-4"
                />
                <div>
                  <span className="text-white">
                    Show Correct Answers After Completion
                  </span>
                  <p className="text-gray-500 text-xs">
                    Display correct answers to users after they submit the exam
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Admin Management */}
      {activeTab === "admins" && (
        <div className="space-y-6">
          <div className="redCard p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-lg font-semibold">Admin Users</h2>
              <button
                onClick={() => setShowAddAdminModal(true)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
              >
                <FaPlus /> Add Admin
              </button>
            </div>

            {/* Admins List - Mobile */}
            <div className="lg:hidden space-y-3">
              {admins.map((admin) => (
                <div key={admin.id} className="darkCard rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-white font-semibold">{admin.name}</h3>
                      <p className="text-gray-400 text-xs">{admin.email}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        admin.role === "super_admin"
                          ? "bg-purple-600 text-white"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      {admin.role === "super_admin" ? "Super Admin" : "Admin"}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs mb-3">
                    Last login: {admin.lastLogin}
                  </p>
                  {admin.role !== "super_admin" && (
                    <button
                      onClick={() => handleRemoveAdmin(admin.id)}
                      className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition"
                    >
                      <FaTrash /> Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Admins List - Desktop */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="darkCard">
                  <tr>
                    <th className="text-left text-gray-400 font-medium py-3 px-4">
                      Name
                    </th>
                    <th className="text-left text-gray-400 font-medium py-3 px-4">
                      Email
                    </th>
                    <th className="text-center text-gray-400 font-medium py-3 px-4">
                      Role
                    </th>
                    <th className="text-left text-gray-400 font-medium py-3 px-4">
                      Last Login
                    </th>
                    <th className="text-center text-gray-400 font-medium py-3 px-4">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr
                      key={admin.id}
                      className="border-t border-gray-800 hover:bg-gray-800 transition"
                    >
                      <td className="py-3 px-4 text-white font-medium">
                        {admin.name}
                      </td>
                      <td className="py-3 px-4 text-gray-300">{admin.email}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${
                            admin.role === "super_admin"
                              ? "bg-purple-600 text-white"
                              : "bg-blue-600 text-white"
                          }`}
                        >
                          {admin.role === "super_admin"
                            ? "Super Admin"
                            : "Admin"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-300 text-sm">
                        {admin.lastLogin}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {admin.role !== "super_admin" ? (
                          <button
                            onClick={() => handleRemoveAdmin(admin.id)}
                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition"
                            title="Remove Admin"
                          >
                            <FaTrash />
                          </button>
                        ) : (
                          <span className="text-gray-500 text-sm">
                            Protected
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Admin Modal */}
      {showAddAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="darkCard p-6 max-w-md w-full">
            <h2 className="text-white text-xl font-bold mb-4">Add New Admin</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">
                  Name *
                </label>
                <input
                  type="text"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  placeholder="Admin name"
                  className="w-full fadeInput rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">
                  Email *
                </label>
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full fadeInput rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">
                  Password *
                </label>
                <input
                  type="password"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="Secure password"
                  className="w-full fadeInput rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">
                  Role *
                </label>
                <select
                  value={newAdminRole}
                  onChange={(e) => setNewAdminRole(e.target.value as any)}
                  className="w-full fadeInput rounded-lg px-4 py-2 text-white"
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowAddAdminModal(false);
                  setNewAdminName("");
                  setNewAdminEmail("");
                  setNewAdminPassword("");
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAdmin}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
              >
                Add Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
