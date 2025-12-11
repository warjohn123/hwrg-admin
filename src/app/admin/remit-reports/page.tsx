'use client';

import ConfirmModal from '@/components/modals/ConfirmationModal';
import Pagination from '@/components/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { fetchRemitReports } from '@/services/remit_reports.service';
import { deleteSalesReport } from '@/services/sales_reports.service';
import { IRemitReport } from '@/types/RemitReport';
import { useEffect, useState } from 'react';
import { FaArrowRight, FaTrash } from 'react-icons/fa6';
import DatePicker, { DateObject } from 'react-multi-date-picker';

export default function RemitReportsPage() {
  const [salesReports, setSalesReports] = useState<IRemitReport[]>([]);
  const [loading, setLoading] = useState(true);
  const { page, setPage, totalPages, setTotal, limit, setLimit } =
    usePagination();
  const [dates, setDates] = useState([new DateObject(), new DateObject()]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = () => {
      setLoading(true);
      Promise.all([loadRemitReports(page, dates)]).then(() => {
        setLoading(false);
      });
    };

    if (dates.length === 2) fetchAllData();
  }, [page, dates, limit]);

  async function loadRemitReports(pageNumber = 1, dates: DateObject[]) {
    setLoading(true);
    try {
      const formattedDates = dates.map((date) => date.format('YYYY-MM-DD'));
      const res = await fetchRemitReports(formattedDates, pageNumber, limit);
      setTotal(res.total ?? 0);
      setSalesReports(res.remit_reports ?? []);
      setLoading(false);
    } catch (e) {
      console.error('Failed to fetch sales reports:', e);
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!selectedReportId) return;
    await deleteSalesReport(selectedReportId);
    setShowDeleteModal(false);
    setSelectedReportId(null);
    loadRemitReports(page, dates);
  }

  if (loading) return <p>Loading remit reports...</p>;

  return (
    <div>
      <div className="flex flex-row gap-4">
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
      </div>
      <div className="mt-5 mb-5">
        {/* <p className="font-bold">Total Remit: {totalRemit.toLocaleString()}</p> */}
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
              <tr
                key={report.id}
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  //   setIsReportDetailsOpen(true);
                  setSelectedReportId(report.id ?? '');
                }}
              >
                <td className="px-6 py-4">{report.title}</td>
                <td className="px-6 py-4">{report.report_date}</td>
                <td className="px-6 py-4">
                  {report.totals?.remit_total.toLocaleString()}
                </td>
                <td className="px-6 py-4 flex gap-10">
                  <FaArrowRight
                    className="cursor-pointer"
                    onClick={() => {
                      //   setIsReportDetailsOpen(true);
                      setSelectedReportId(report.id ?? '');
                    }}
                  />
                  <FaTrash
                    className="cursor-pointer text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
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

        {/* {isReportDetailsOpen && (
          <ChickyOinkReportDetails
            isOpen={isReportDetailsOpen}
            setIsOpen={setIsReportDetailsOpen}
            reportId={selectedReportId ?? ''}
          />
        )} */}
      </div>

      <Pagination
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        page={page}
        totalPages={totalPages}
      />
    </div>
  );
}
