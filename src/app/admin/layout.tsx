"use client";

import Sidebar from "@/components/Sidebar";
import { useState } from "react";
import { Menu } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

        {/* Right side */}
        <div className="flex-1 flex flex-col bg-gray-100 h-screen overflow-hidden">
          {/* Header bar */}
          <div className="flex items-center justify-between bg-white px-6 py-4 shadow-md md:ml-0">
            {/* Mobile toggle button */}
            <button
              className="md:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          </div>

          {/* Page content */}
          <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
