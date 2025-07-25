'use client';

import ConfirmModal from '@/components/modals/ConfirmationModal';
import Pagination from '@/components/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { fetchAllBranches } from '@/services/branch.service';
import {
  deleteSalesReport,
  fetchSalesReports,
} from '@/services/sales_reports.service';
import { IBranch } from '@/types/Branch';
import { IChickyOinkReport } from '@/types/ChickyOinkReport';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaArrowRight, FaTrash } from 'react-icons/fa6';
import DatePicker, { DateObject } from 'react-multi-date-picker';

export default function ReportsPage() {
  const [salesReports, setSalesReports] = useState<IChickyOinkReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<IBranch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const { page, setPage, totalPages, setTotal, pageSize } = usePagination();
  const [dates, setDates] = useState([new DateObject(), new DateObject()]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = () => {
      setLoading(true);
      Promise.all([
        getSalesReports(page, selectedBranch, dates),
        getBranches(),
      ]).then(() => {
        setLoading(false);
      });
    };

    if (dates.length === 2) fetchAllData();
  }, [page, selectedBranch, dates]);

  async function getSalesReports(
    pageNumber = 1,
    branchId = '',
    dates: DateObject[],
  ) {
    setLoading(true);
    try {
      const formattedDates = dates.map((date) => date.format('YYYY-MM-DD'));
      const res = await fetchSalesReports(
        pageNumber,
        pageSize,
        branchId,
        formattedDates,
      );
      setTotal(res.total);
      setSalesReports(res.sales_reports);
      setLoading(false);
    } catch (e) {
      console.error('Failed to fetch sales reports:', e);
      setLoading(false);
    }
  }

  async function getBranches() {
    const res = await fetchAllBranches();
    setBranches(res.branches);
  }

  function getExpenses(name: string) {
    return salesReports
      .reduce((acc, report) => {
        const total = report.expenses.reduce((sum, expense) => {
          return sum + (expense.name === name ? Number(expense.value) : 0);
        }, 0);
        return acc + total;
      }, 0)
      .toLocaleString();
  }

  function getActualRemit(salesReport: IChickyOinkReport) {
    return (
      salesReport.cash -
      salesReport.inventory.poso.sales * 8
    ).toLocaleString();
  }

  const totalRemit = salesReports.reduce((acc, report) => {
    return acc + report.cash - report.inventory.poso.sales * 8;
  }, 0);

  async function handleDelete() {
    if (!selectedReportId) return;
    await deleteSalesReport(selectedReportId);
    setShowDeleteModal(false);
    setSelectedReportId(null);
    getSalesReports(page, selectedBranch, dates);
  }

  if (loading) return <p>Loading sales reports...</p>;

  return (
    <div>
      <div className="flex flex-row gap-4">
        <div>
          <label>Select a branch</label>
          <div>
            <select
              name="branch"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
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
              onChange={setDates}
              format="YYYY-MM-DD"
              range
            />
          </div>
        </div>
      </div>
      <div className="mt-5 mb-5">
        <p className="font-bold">Total Remit: {totalRemit.toLocaleString()}</p>
        <div className="flex gap-10">
          <div className="font-bold">Grab: {getExpenses('Grab')}</div>
          <div className="font-bold">FoodPanda: {getExpenses('FoodPanda')}</div>
          <div className="font-bold">GCash: {getExpenses('GCash')}</div>
        </div>
      </div>
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-6 py-3 text-sm font-medium">Title</th>
              <th className="px-6 py-3 text-sm font-medium">Date</th>
              <th className="px-6 py-3 text-sm font-medium">Remit</th>
              <th className="px-6 py-3 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {salesReports.map((report) => (
              <tr key={report.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{report.title}</td>
                <td className="px-6 py-4">{report.report_date}</td>
                <td className="px-6 py-4">{getActualRemit(report)}</td>
                <td className="px-6 py-4 flex gap-10">
                  <Link target="_blank" href={`/admin/reports/${report.id}`}>
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
    </div>
  );
}
