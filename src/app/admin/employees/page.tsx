"use client";

import SaveEmployeeModal from "@/components/modals/SaveEmployeeModal";
import { IUser } from "@/types/User";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<IUser[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 5;

  useEffect(() => {
    fetchEmployees(page);
  }, [page]);

  function fetchEmployees(pageNumber = 1) {
    fetch(`/api/users?page=${pageNumber}&limit=${pageSize}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("data", data);
        setTotal(data.total);
        setEmployees(data.users);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch users:", err);
        setLoading(false);
      });
  }

  const totalPages = Math.ceil(total / pageSize);

  if (loading) return <p>Loading employees...</p>;

  return (
    <div>
      {/* Header with Add Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Employees</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 cursor-pointer text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Add Employee
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-6 py-3 text-sm font-medium">Name</th>
              <th className="px-6 py-3 text-sm font-medium">Email</th>
              <th className="px-6 py-3 text-sm font-medium">Assignment</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr
                key={emp.id}
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => redirect(`/admin/employees/${emp.id}`)}
              >
                <td className="px-6 py-4">{emp.name}</td>
                <td className="px-6 py-4">{emp.email}</td>
                <td className="px-6 py-4">{emp.assignment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center mt-6 space-x-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          disabled={page === 1}
        >
          Prev
        </button>
        <span className="px-4 py-2 text-sm font-medium">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>

      {isModalOpen && (
        <SaveEmployeeModal
          setIsModalOpen={setIsModalOpen}
          fetchEmployees={fetchEmployees}
          isModalOpen={isModalOpen}
        />
      )}
    </div>
  );
}
