'use client';

import { useEffect, useState } from 'react';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import { usePagination } from '@/hooks/usePagination';
import { FaTrash } from 'react-icons/fa6';
import ConfirmModal from '@/components/modals/ConfirmationModal';
import Pagination from '@/components/Pagination';
import { ICompanyExpense } from '@/types/CompanyExpenses';
import {
  deleteCompanyExpense,
  fetchCompanyExpenses,
} from '@/services/company_expenses.service';
import { IAssignment } from '@/types/User';
import SaveCompanyExpenseModal from './modals/SaveCompanyExpense';
import { IBranch } from '@/types/Branch';
import { fetchBranches } from '@/services/branch.service';
import { FaEdit } from 'react-icons/fa';

interface Props {
  type: IAssignment;
}

export default function ExpensesTable({ type }: Props) {
  const [companyExpenses, setCompanyExpenses] = useState<ICompanyExpense[]>([]);
  const { page, setPage, totalPages, setTotal, limit, setLimit } = usePagination();
  const [dates, setDates] = useState([new DateObject(), new DateObject()]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [branches, setBranches] = useState<IBranch[]>([]);
  const [selectedExpense, setSelectedExpense] =
    useState<ICompanyExpense | null>(null);
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    if (dates.length === 2 && debouncedSearch !== undefined) fetchExpenses();
  }, [page, selectedBranch, dates, debouncedSearch, limit]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // Debounce delay in ms

    return () => {
      clearTimeout(handler); // Cleanup if value changes
    };
  }, [search]);

  useEffect(() => {
    getBranches();
  }, []);

  async function handleDelete() {
    if (!selectedReportId) return;
    await deleteCompanyExpense(selectedReportId);
    setShowDeleteModal(false);
    setSelectedReportId(null);
    fetchExpenses();
  }

  async function getBranches() {
    const res = await fetchBranches(type);
    setBranches(res.branches);
  }

  async function fetchExpenses() {
    setLoading(true);
    try {
      const formattedDates = dates.map((date) => date.format('YYYY-MM-DD'));
      const res = await fetchCompanyExpenses(
        formattedDates,
        type,
        selectedBranch,
        page,
        limit,
        search,
      );
      setTotal(res.total ?? 0);
      setCompanyExpenses(res.company_expenses ?? []);
      setLoading(false);
    } catch (e) {
      console.error(`Failed to fetch ${type} expenses:`, e);
      setLoading(false);
    }
  }

  const totalExpenses = companyExpenses.reduce(
    (acc, curr) => acc + curr.amount,
    0,
  );

  return (
    <div>
      <div className="mt-5 mb-5">
        <p className="font-bold">
          Total Expenses: {totalExpenses.toLocaleString()}
        </p>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-5">
          <div>
            <label>Select a branch</label>
            <div>
              <select
                name="branch"
                value={selectedBranch}
                onChange={(e) => {
                  setPage(1);
                  setSelectedBranch(e.target.value);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Branches</option>
                {branches?.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.branch_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label>Select dates</label>
            <div>
              <DatePicker
                style={{ zIndex: 9999, height: '38px', width: '200px' }}
                value={dates}
                onChange={(e) => {
                  setPage(1);
                  setDates(e);
                }}
                format="YYYY-MM-DD"
                range
              />
            </div>
          </div>
          <div>
            <label>Search</label>
            <div>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name"
                className="px-4 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsSaveModalOpen(true)}
          className="bg-blue-600 cursor-pointer text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Add Expense
        </button>
      </div>

      {loading && <p>Loading {type} expenses...</p>}
      {!loading && (
        <>
          <div className="overflow-x-auto bg-white rounded shadow">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-6 py-3 text-sm font-medium">Date</th>
                  <th className="px-6 py-3 text-sm font-medium">Name</th>
                  <th className="px-6 py-3 text-sm font-medium">Amount</th>
                  <th className="px-6 py-3 text-sm font-medium">Branch</th>
                  <th className="px-6 py-3 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {companyExpenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4">{expense.date}</td>
                    <td className="px-6 py-4">{expense.name}</td>
                    <td className="px-6 py-4">{expense.amount}</td>
                    <td className="px-6 py-4">
                      {expense.branches?.branch_name}
                    </td>
                    <td className="px-6 py-4 flex gap-10">
                      <FaEdit
                        className="cursor-pointer"
                        onClick={() => {
                          setIsSaveModalOpen(true);
                          setSelectedExpense(expense ?? null);
                        }}
                      />
                      <FaTrash
                        className="cursor-pointer text-red-500"
                        onClick={() => {
                          setShowDeleteModal(true);
                          setSelectedReportId(expense.id ?? null);
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <ConfirmModal
              isOpen={showDeleteModal}
              onClose={() => setShowDeleteModal(false)}
              onConfirm={handleDelete}
              title="Delete Expense?"
              description="Are you sure you want to delete this expense? This cannot be undone."
              confirmText="Delete"
            />
          </div>

          <Pagination setPage={setPage} page={page} limit={limit} setLimit={setLimit} totalPages={totalPages} />
          <SaveCompanyExpenseModal
            setSelectedExpense={setSelectedExpense}
            expense={selectedExpense ?? undefined}
            isOpen={isSaveModalOpen}
            type={type}
            fetchExpenses={fetchExpenses}
            setIsOpen={setIsSaveModalOpen}
          />
        </>
      )}
    </div>
  );
}
