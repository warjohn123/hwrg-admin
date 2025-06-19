import Sidebar from "@/components/Sidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Right side */}
      <div className="flex-1 flex flex-col bg-gray-100">
        {/* Header bar */}
        <div className="flex items-center justify-between bg-white px-6 py-4 shadow-md">
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          {/* <form
            action="/login"
            method="post"
            onSubmit={(e) => {
              e.preventDefault();
              // If you're using Supabase, call signOut here
              // e.g., await supabase.auth.signOut();
              window.location.href = "/login";
            }}
          > */}
          <button
            type="submit"
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
          {/* </form> */}
        </div>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
