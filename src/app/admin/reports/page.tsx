'use client';

import Pagination from '@/components/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { fetchAllBranches } from '@/services/branch.service';
import { fetchSalesReports } from '@/services/sales_reports.service';
import { IBranch } from '@/types/Branch';
import { SalesReport } from '@/types/SalesReport';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaArrowRight } from 'react-icons/fa6';
import DatePicker, { DateObject } from 'react-multi-date-picker';

export default function ReportsPage() {
  const [salesReports, setSalesReports] = useState<SalesReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<IBranch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const { page, setPage, totalPages, setTotal, pageSize } = usePagination();
  const [dates, setDates] = useState([new DateObject(), new DateObject()]);

  useEffect(() => {
    const fetchAllData = () => {
      Promise.all([getSalesReports(page, selectedBranch), getBranches()]).then(
        () => {
          setLoading(false);
        },
      );
    };

    fetchAllData();
  }, [page, selectedBranch]);

  async function getSalesReports(pageNumber = 1, branchId = '') {
    try {
      const res = await fetchSalesReports(pageNumber, pageSize, branchId);
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

  if (loading) return <p>Loading sales reports...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Sales Reports</h2>
      </div>
      <div className="flex flex-row gap-4">
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
        <DatePicker
          style={{ zIndex: 9999, height: '45px', width: '200px' }}
          value={dates}
          onChange={setDates}
          range
        />
      </div>
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-6 py-3 text-sm font-medium">Title</th>
              <th className="px-6 py-3 text-sm font-medium">Date</th>
              <th className="px-6 py-3 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {salesReports.map((report) => (
              <tr key={report.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{report.title}</td>
                <td className="px-6 py-4">{report.report_date}</td>
                <td className="px-6 py-4 flex gap-10">
                  <FaArrowRight
                    className="cursor-pointer"
                    onClick={() => redirect(`/admin/reports/${report.id}`)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination setPage={setPage} page={page} totalPages={totalPages} />
    </div>
  );
}
