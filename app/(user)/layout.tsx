import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <Header />
      <main className="pt-16 pb-12 px-4 sm:px-6 max-w-7xl mx-auto">
        {children}
      </main>
      <Footer />
    </div>
  );
}
