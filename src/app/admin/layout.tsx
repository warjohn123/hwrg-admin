import Sidebar from "@/components/Sidebar";

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
      <div className="flex-1 flex flex-col bg-gray-100 overflow-auto h-screen">
        {/* Header bar */}
        <div className="flex items-center justify-between bg-white px-6 py-4 shadow-md">
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
