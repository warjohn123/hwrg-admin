export default function AdminDashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="p-6 bg-white rounded shadow">Users: 120</div>
        <div className="p-6 bg-white rounded shadow">Clock-ins: 342</div>
        <div className="p-6 bg-white rounded shadow">Reports: 12</div>
      </div>
    </div>
  );
}
