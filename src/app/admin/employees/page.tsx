'use client';

import SaveEmployeeModal from '@/components/modals/SaveEmployeeModal';
import { IUser } from '@/types/User';
import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import Pagination from '@/components/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { toast } from 'react-toastify';
import { getEmployees } from '@/services/employees.service';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<IUser[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { page, setPage, setTotal, totalPages, limit } = usePagination();

  useEffect(() => {
    if (debouncedSearch !== undefined) fetchEmployees();
  }, [page, debouncedSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // Debounce delay in ms

    return () => {
      clearTimeout(handler); // Cleanup if value changes
    };
  }, [search]);

  async function fetchEmployees() {
    setLoading(true);
    try {
      const res = await getEmployees(page, limit, search);
      setEmployees(res.users);
      setTotal(res.total);
    } catch (e) {
      toast.error('Failed to fetch employees');
      console.error('Failed to fetch users: ', e);
    } finally {
      setLoading(false);
    }
  }

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

      <div className="mb-5">
        <label>Search</label>
        <div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employee by name"
            className="px-4 py-2 border border-gray-300 w-64 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading && <p>Loading employees....</p>}
      {!loading && (
        <>
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

          <Pagination setPage={setPage} totalPages={totalPages} page={page} />

          {isModalOpen && (
            <SaveEmployeeModal
              setIsModalOpen={setIsModalOpen}
              fetchEmployees={fetchEmployees}
              isModalOpen={isModalOpen}
            />
          )}
        </>
      )}
    </div>
  );
}
