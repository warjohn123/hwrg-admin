'use client';

import Pagination from '@/components/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { SalesReport } from '@/types/SalesReport';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaArrowRight } from 'react-icons/fa6';

export default function ReportsPage() {
  const [salesReports, setSalesReports] = useState<SalesReport[]>([]);
  const [loading, setLoading] = useState(true);
  const { page, setPage, totalPages, setTotal, pageSize } = usePagination();

  useEffect(() => {
    fetchSalesReports(page);
  }, [page]);

  function fetchSalesReports(pageNumber = 1) {
    fetch(`/api/sales-reports?page=${pageNumber}&limit=${pageSize}`)
      .then((res) => res.json())
      .then((data) => {
        setTotal(data.total);
        setSalesReports(data.sales_reports);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch sales reports:', err);
        setLoading(false);
      });
  }

  if (loading) return <p>Loading sales reports...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Sales Reports</h2>
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
