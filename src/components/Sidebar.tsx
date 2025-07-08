"use client";

import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const linkClasses = (href: string) =>
    `hover:text-yellow-400 ${
      pathname === href ? "text-yellow-400 font-semibold" : "text-white"
    }`;

  return (
    <aside
      className={`
        fixed top-0 left-0 min-h-screen bg-gray-800 text-white p-5 z-50 transition-transform duration-300
        w-64
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:relative md:flex md:flex-col
      `}
    >
      {/* Close button for mobile */}
      <div className="md:hidden flex justify-end mb-4">
        <button onClick={() => setIsOpen(false)}>
          <X size={24} />
        </button>
      </div>

      <h1 className="text-xl font-bold mb-6 hidden md:block">HWRG</h1>
      <nav className="flex flex-col space-y-4">
        <Link
          href="/admin/dashboard"
          className={linkClasses("/admin/dashboard")}
        >
          Dashboard
        </Link>
        <Link
          href="/admin/employees"
          className={linkClasses("/admin/employees")}
        >
          Employees
        </Link>
        <Link href="/admin/reports" className={linkClasses("/admin/reports")}>
          Reports
        </Link>
        <Link href="/admin/timelogs" className={linkClasses("/admin/timelogs")}>
          Time Logs
        </Link>
        <div onClick={logout} className="hover:text-yellow-400 cursor-pointer">
          Logout
        </div>
      </nav>
    </aside>
  );
}
