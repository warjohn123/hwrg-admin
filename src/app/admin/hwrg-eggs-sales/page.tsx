'use client';

import HWRGEggsReportDetails from '@/components/HWRGEggsReportDetails';
import ConfirmModal from '@/components/modals/ConfirmationModal';
import Pagination from '@/components/Pagination';
import { HWRG_EGGS_INVENTORY_DISPLAY_ORDER } from '@/constants/displayOrder';
import { usePagination } from '@/hooks/usePagination';
import { getHWRGEggsTotalSales } from '@/lib/getHWRGEggsTotalSales';
import { fetchBranches } from '@/services/branch.service';
import {
  deleteSalesReport,
  fetchSalesReports,
} from '@/services/sales_reports.service';
import { IBranch } from '@/types/Branch';
import {
  IHWRGEggsReport,
  IHWRGEggsReportInventory,
} from '@/types/HWRGEggsReport';
import { IAssignment } from '@/types/User';
import { useEffect, useState } from 'react';
import { FaArrowRight, FaTrash } from 'react-icons/fa6';
import DatePicker, { DateObject } from 'react-multi-date-picker';

const TRAY_SIZE = 30;

export default function ReportsPage() {
  const [salesReports, setSalesReports] = useState<IHWRGEggsReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<IBranch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const { page, setPage, totalPages, setTotal, limit, setLimit } =
    usePagination();
  const [dates, setDates] = useState([new DateObject(), new DateObject()]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isReportDetailsOpen, setIsReportDetailsOpen] = useState(false);

  useEffect(() => {
    const fetchAllData = () => {
      setLoading(true);
      Promise.all([getSalesReports(page, selectedBranch, dates)]).then(() => {
        setLoading(false);
      });
    };

    if (dates.length === 2) fetchAllData();
  }, [page, selectedBranch, dates, limit]);

  useEffect(() => {
    getBranches();
  }, []);

  async function getSalesReports(
    pageNumber = 1,
    branchId = '',
    dates: DateObject[],
  ) {
    setLoading(true);
    try {
      const formattedDates = dates.map((date) => date.format('YYYY-MM-DD'));
      const res = await fetchSalesReports(
        branchId,
        formattedDates,
        IAssignment.HWRG_EGGS,
        pageNumber,
        limit,
      );
      setTotal(res.total ?? 0);
      setSalesReports(res.sales_reports ?? []);
      setLoading(false);
    } catch (e) {
      console.error('Failed to fetch sales reports:', e);
      setLoading(false);
    }
  }

  async function getBranches() {
    const res = await fetchBranches(IAssignment.HWRG_EGGS);
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

  const totalRemit = salesReports.reduce((acc, report) => {
    return acc + report.cash;
  }, 0);

  const totalSales = salesReports.reduce((acc, report) => {
    return acc + getHWRGEggsTotalSales(report.sales);
  }, 0);

  const totalRemainingEggs = salesReports.reduce((acc, report) => {
    return (
      acc +
      report.inventory.pl.remaining_stocks.trays * TRAY_SIZE +
      report.inventory.pl.remaining_stocks.pcs +
      report.inventory.pw.remaining_stocks.trays * TRAY_SIZE +
      report.inventory.pw.remaining_stocks.pcs +
      report.inventory.small.remaining_stocks.trays * TRAY_SIZE +
      report.inventory.small.remaining_stocks.pcs +
      report.inventory.medium.remaining_stocks.trays * TRAY_SIZE +
      report.inventory.medium.remaining_stocks.pcs +
      report.inventory.large.remaining_stocks.trays * TRAY_SIZE +
      report.inventory.large.remaining_stocks.pcs +
      report.inventory.xl.remaining_stocks.trays * TRAY_SIZE +
      report.inventory.xl.remaining_stocks.pcs
    );
  }, 0);

  async function handleDelete() {
    if (!selectedReportId) return;
    await deleteSalesReport(selectedReportId);
    setShowDeleteModal(false);
    setSelectedReportId(null);
    getSalesReports(page, selectedBranch, dates);
  }

  function getShortAndOver(report: IHWRGEggsReport) {
    const totalExpenses = report.expenses.reduce(
      (partialSum, a) => partialSum + (a.value || 0),
      0,
    );

    const totalRemit = getHWRGEggsTotalSales(report.sales) - totalExpenses;
    const cash = report.cash;
    const totalShort = totalRemit - cash;
    const totalOver = cash - totalRemit;
    return { totalShort, totalOver };
  }

  function getPullOuts(data: IHWRGEggsReportInventory) {
    const result: Record<string, number> = {};

    Object.entries(data).forEach(([key, value]) => {
      if (value.pull_out.trays > 0) {
        result[key] = value.pull_out.trays;
      }
    });

    return result;
  }

  function getDelivered(data: IHWRGEggsReportInventory) {
    const result: Record<string, number> = {};

    Object.entries(data).forEach(([key, value]) => {
      if (value.delivered.trays > 0) {
        result[key] = value.delivered.trays;
      }
    });

    return result;
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
      </div>
      <div className="mt-5 mb-5">
        <p className="font-bold">Total Sales: {totalSales.toLocaleString()}</p>
        <p className="font-bold">Total Remit: {totalRemit.toLocaleString()}</p>
        <p className="font-bold">
          Total Remaining No. of Eggs: {totalRemainingEggs}
        </p>
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
              <th className="px-6 py-3 text-sm font-medium">Sales</th>
              <th className="px-6 py-3 text-sm font-medium">Remit</th>
              <th className="px-6 py-3 text-sm font-medium">Pull Outs</th>
              <th className="px-6 py-3 text-sm font-medium">Delivered</th>
              <th className="px-6 py-3 text-sm font-medium">Short/Over</th>
              <th className="px-6 py-3 text-sm font-medium">On Duty</th>
              <th className="px-6 py-3 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {salesReports.map((report) => (
              <tr
                key={report.id}
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setIsReportDetailsOpen(true);
                  setSelectedReportId(report.id ?? '');
                }}
              >
                <td className="px-6 py-4">{report.title}</td>
                <td className="px-6 py-4">{report.report_date}</td>
                <td className="px-6 py-4">
                  {getHWRGEggsTotalSales(report.sales).toLocaleString()}
                </td>
                <td className="px-6 py-4">{report.cash.toLocaleString()}</td>
                <td className="px-6 py-4">
                  {Object.entries(getPullOuts(report.inventory))
                    .sort(
                      (a, b) =>
                        HWRG_EGGS_INVENTORY_DISPLAY_ORDER.indexOf(a[0]) -
                        HWRG_EGGS_INVENTORY_DISPLAY_ORDER.indexOf(b[0]),
                    )
                    .map(([key, value]) => (
                      <div key={key}>
                        {key}: {value}
                      </div>
                    ))}
                </td>
                <td className="px-6 py-4">
                  {Object.entries(getDelivered(report.inventory))
                    .sort(
                      (a, b) =>
                        HWRG_EGGS_INVENTORY_DISPLAY_ORDER.indexOf(a[0]) -
                        HWRG_EGGS_INVENTORY_DISPLAY_ORDER.indexOf(b[0]),
                    )
                    .map(([key, value]) => (
                      <div key={key}>
                        {key}: {value}
                      </div>
                    ))}
                </td>
                <td className="px-6 py-4">
                  {getShortAndOver(report).totalShort > 0 && (
                    <div className="text-red-500">
                      Short: {getShortAndOver(report).totalShort}
                    </div>
                  )}
                  {getShortAndOver(report).totalOver > 0 && (
                    <div className="text-green-500">
                      Over: {getShortAndOver(report).totalOver}
                    </div>
                  )}
                </td>
                <td>{report.on_duty}</td>
                <td className="px-6 py-4 flex gap-10">
                  <FaArrowRight
                    className="cursor-pointer"
                    onClick={() => {
                      setIsReportDetailsOpen(true);
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

        {isReportDetailsOpen && (
          <HWRGEggsReportDetails
            isOpen={isReportDetailsOpen}
            setIsOpen={setIsReportDetailsOpen}
            reportId={selectedReportId ?? ''}
          />
        )}
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
