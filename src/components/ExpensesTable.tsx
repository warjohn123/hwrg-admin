'use client';

import { useEffect, useState } from 'react';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import { usePagination } from '@/hooks/usePagination';
import { deleteCollectionReport } from '@/services/collection_reports.service';
import Link from 'next/link';
import { FaArrowRight, FaTrash } from 'react-icons/fa6';
import ConfirmModal from '@/components/modals/ConfirmationModal';
import Pagination from '@/components/Pagination';
import { ICompanyExpense } from '@/types/CompanyExpenses';
import { fetchCompanyExpenses } from '@/services/company_expenses.service';
import { IAssignment } from '@/types/User';
import SaveCompanyExpenseModal from './modals/SaveCompanyExpense';

interface Props {
  type: IAssignment;
}

export default function ExpensesTable({ type }: Props) {
  const [companyExpenses, setCompanyExpenses] = useState<ICompanyExpense[]>([]);
  const { page, setPage, totalPages, setTotal, pageSize } = usePagination();
  const [dates, setDates] = useState([new DateObject(), new DateObject()]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  useEffect(() => {
    init();
  }, []);

  async function handleDelete() {
    if (!selectedReportId) return;
    await deleteCollectionReport(selectedReportId);
    setShowDeleteModal(false);
    setSelectedReportId(null);
    init();
  }

  async function init() {
    setLoading(true);
    try {
      const formattedDates = dates.map((date) => date.format('YYYY-MM-DD'));
      const res = await fetchCompanyExpenses(
        page,
        pageSize,
        formattedDates,
        type,
      );
      setTotal(res.total ?? 0);
      setCompanyExpenses(res.company_expenses ?? []);
      setLoading(false);
    } catch (e) {
      console.error(`Failed to fetch ${type} expenses:`, e);
      setLoading(false);
    }
  }

  if (loading) return <p>Loading {type} expenses...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <label>Select dates</label>
          <div>
            <DatePicker
              style={{ zIndex: 9999, height: '38px', width: '200px' }}
              value={dates}
              onChange={setDates}
              format="YYYY-MM-DD"
              range
            />
          </div>
        </div>
        <button
          onClick={() => setIsSaveModalOpen(true)}
          className="bg-blue-600 cursor-pointer text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Add Expense
        </button>
      </div>
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-6 py-3 text-sm font-medium">Date</th>
              <th className="px-6 py-3 text-sm font-medium">Name</th>
              <th className="px-6 py-3 text-sm font-medium">Amount</th>
              <th className="px-6 py-3 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {companyExpenses.map((report) => (
              <tr
                key={report.id}
                className="border-b hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-4">{report.date}</td>
                <td className="px-6 py-4">{report.name}</td>
                <td className="px-6 py-4">{report.amount}</td>
                <td className="px-6 py-4 flex gap-10">
                  <Link
                    target="_blank"
                    href={`/admin/collection-reports/${report.id}`}
                  >
                    <FaArrowRight className="cursor-pointer" />
                  </Link>
                  <FaTrash
                    className="cursor-pointer text-red-500"
                    onClick={() => {
                      setShowDeleteModal(true);
                      setSelectedReportId(report.id ?? null);
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
          title="Delete Sales Report?"
          description="Are you sure you want to delete this report? This cannot be undone."
          confirmText="Delete"
        />
      </div>

      <Pagination setPage={setPage} page={page} totalPages={totalPages} />
      <SaveCompanyExpenseModal
        expense={undefined}
        isOpen={isSaveModalOpen}
        type={type}
        fetchExpenses={init}
        setIsOpen={setIsSaveModalOpen}
      />
      {/* <SaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSave}
      /> */}
    </div>
  );
}
