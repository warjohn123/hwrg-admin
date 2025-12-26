'use client';

import { getChickyOinkTotalSales } from '@/lib/getChickyOinkTotalSales';
import { getHWRGEggsTotalSales } from '@/lib/getHWRGEggsTotalSales';
import { getImagawayakiTotalSales } from '@/lib/getImagawayakiTotalSales';
import { getPotatoFryTotalSales } from '@/lib/getPotatoFryTotalSales';
import { fetchBranches } from '@/services/branch.service';
import { fetchCompanyExpenses } from '@/services/company_expenses.service';
import { fetchSalesReports } from '@/services/sales_reports.service';
import { IBranch } from '@/types/Branch';
import { ChickyOinkSales, IChickyOinkReport } from '@/types/ChickyOinkReport';
import { ICompanyExpense } from '@/types/CompanyExpenses';
import { IHWRGEggsReport, IHWRGEggsSales } from '@/types/HWRGEggsReport';
import {
  IImagawayakiReport,
  ImagawayakiSales,
} from '@/types/ImagawayakiReport';
import { IPotatoFryReport, PotatoFrySales } from '@/types/PotatoFryReport';
import { IAssignment } from '@/types/User';
import { useEffect, useMemo, useState } from 'react';
import DatePicker, { DateObject } from 'react-multi-date-picker';

interface Props {
  type: IAssignment;
}

export default function MonthlySales({ type }: Props) {
  const today = new DateObject();
  const startOfMonth = new DateObject(today).setDay(1);

  const [dates, setDates] = useState([startOfMonth, today]);
  const [companyExpenses, setCompanyExpenses] = useState<ICompanyExpense[]>([]);
  const [salesReports, setSalesReports] = useState<
    | IChickyOinkReport[]
    | IImagawayakiReport[]
    | IPotatoFryReport[]
    | IHWRGEggsReport[]
  >([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [branches, setBranches] = useState<IBranch[]>([]);
  const [loading, setLoading] = useState(false);

  async function getSalesReports() {
    setLoading(true);
    try {
      const formattedDates = dates.map((date) => date.format('YYYY-MM-DD'));
      const res = await fetchSalesReports(selectedBranch, formattedDates, type);
      setSalesReports(res.sales_reports ?? []);
      setLoading(false);
    } catch (e) {
      console.error('Failed to fetch sales reports:', e);
      setLoading(false);
    }
  }

  async function fetchExpenses() {
    setLoading(true);
    try {
      const formattedDates = dates.map((date) => date.format('YYYY-MM-DD'));
      const res = await fetchCompanyExpenses(
        formattedDates,
        type,
        selectedBranch,
      );
      setCompanyExpenses(res.company_expenses ?? []);
      setLoading(false);
    } catch (e) {
      console.error(`Failed to fetch ${type} expenses:`, e);
      setLoading(false);
    }
  }

  async function getBranches() {
    const res = await fetchBranches(type);
    setBranches(res.branches);
  }

  useEffect(() => {
    if (dates.length === 2) {
      getSalesReports();
      fetchExpenses();
    }
  }, [selectedBranch, dates]);

  useEffect(() => {
    getBranches();
  }, []);

  const totalSales = useMemo(() => {
    return salesReports.reduce((acc, report) => {
      const sales = report.sales;

      switch (type) {
        case IAssignment.CHICKY_OINK:
          return acc + getChickyOinkTotalSales(sales as ChickyOinkSales);

        case IAssignment.IMAGAWAYAKI:
          return acc + getImagawayakiTotalSales(sales as ImagawayakiSales);

        case IAssignment.HWRG_EGGS:
          return acc + getHWRGEggsTotalSales(sales as IHWRGEggsSales);

        default:
          return acc + getPotatoFryTotalSales(sales as PotatoFrySales);
      }
    }, 0);
  }, [salesReports, type]);

  const totalExpenses = useMemo(
    () => companyExpenses.reduce((sum, { amount }) => sum + amount, 0),
    [companyExpenses],
  );

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
              onChange={(e) => {
                setDates(e);
              }}
              format="YYYY-MM-DD"
              range
            />
          </div>
        </div>
      </div>

      {loading && <>Loading...</>}

      {!loading && (
        <div className="mt-5">
          <p>Total Sales: {totalSales.toLocaleString()}</p>
          <p>Total Expenses: {totalExpenses.toLocaleString()}</p>
          <p>Total Profit: {(totalSales - totalExpenses).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}
