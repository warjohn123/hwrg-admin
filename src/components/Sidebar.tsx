"use client";

import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
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
    <aside className="w-64 h-screen bg-gray-800 text-white p-5">
      <h1 className="text-xl font-bold mb-6">HWRG</h1>
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
