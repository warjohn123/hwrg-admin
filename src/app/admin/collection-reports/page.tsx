'use client';

import { ICollectionReport } from '@/types/CollectionReport';
import { useEffect, useState } from 'react';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import { usePagination } from '@/hooks/usePagination';
import {
  deleteCollectionReport,
  fetchCollectionReports,
} from '@/services/collection_reports.service';
import Link from 'next/link';
import { FaArrowRight, FaTrash } from 'react-icons/fa6';
import ConfirmModal from '@/components/modals/ConfirmationModal';
import Pagination from '@/components/Pagination';

export default function CollectionReportsPage() {
  const [collectionReports, setCollectionReports] = useState<
    ICollectionReport[]
  >([]);
  const { page, setPage, totalPages, setTotal, limit } = usePagination();
  const [dates, setDates] = useState([new DateObject(), new DateObject()]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);

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
      const res = await fetchCollectionReports(page, limit, formattedDates);
      setTotal(res.total ?? 0);
      setCollectionReports(res.collection_reports ?? []);
      setLoading(false);
    } catch (e) {
      console.error('Failed to fetch collection reports:', e);
      setLoading(false);
    }
  }

  if (loading) return <p>Loading collection reports...</p>;

  return (
    <div>
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
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-6 py-3 text-sm font-medium">Date</th>
              <th className="px-6 py-3 text-sm font-medium">Remit</th>
              <th className="px-6 py-3 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {collectionReports.map((report) => (
              <tr
                key={report.id}
                className="border-b hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-4">{report.date}</td>
                <td className="px-6 py-4">{}</td>
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
    </div>
  );
}
