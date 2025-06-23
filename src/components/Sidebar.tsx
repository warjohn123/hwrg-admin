"use client";

import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function Sidebar() {
  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };
  return (
    <aside className="w-64 h-screen bg-gray-800 text-white p-5">
      <h1 className="text-xl font-bold mb-6">Admin</h1>
      <nav className="flex flex-col space-y-4">
        <Link href="/admin" className="hover:text-yellow-400">
          Dashboard
        </Link>
        <Link href="/admin/employees" className="hover:text-yellow-400">
          Employees
        </Link>
        <Link href="/admin/reports" className="hover:text-yellow-400">
          Reports
        </Link>
        <Link href="/admin/timelogs" className="hover:text-yellow-400">
          Time Logs
        </Link>
        <div onClick={logout} className="hover:text-yellow-400 cursor-pointer">
          Logout
        </div>
      </nav>
    </aside>
  );
}
