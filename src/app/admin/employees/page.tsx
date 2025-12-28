'use client';

import SaveEmployeeModal from '@/components/modals/SaveEmployeeModal';
import { IUser } from '@/types/User';
import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import Pagination from '@/components/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { getEmployees } from '@/services/employees.service';
import { useQuery } from '@tanstack/react-query';

export default function EmployeesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { page, setPage, limit } = usePagination();
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ['employees', page, limit, debouncedSearch],
    queryFn: () => getEmployees(page, limit, debouncedSearch),
  });

  useEffect(() => {
    if (debouncedSearch !== undefined) refetch();
  }, [page, debouncedSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // Debounce delay in ms

    return () => {
      clearTimeout(handler); // Cleanup if value changes
    };
  }, [search]);

  if (error) return <p>Error loading employees: {error.message}</p>;

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

      {isPending && <p>Loading employees....</p>}
      {!isPending && (
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
                {data?.users.map((emp: IUser) => (
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

          <Pagination setPage={setPage} totalPages={data.total} page={page} />

          {isModalOpen && (
            <SaveEmployeeModal
              setIsModalOpen={setIsModalOpen}
              fetchEmployees={refetch}
              isModalOpen={isModalOpen}
            />
          )}
        </>
      )}
    </div>
  );
}
