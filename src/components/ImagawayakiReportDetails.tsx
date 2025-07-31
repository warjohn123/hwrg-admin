'use client';

import { IMAGAWAYAKI_INVENTORY_DISPLAY_ORDER } from '@/constants/displayOrder';
import Divider from './UI/Divider';
import { IMAGAWAYAKI_PRODUCTS } from '@/constants/ImagawayakiProduct';
import {
  IImagawayakiReport,
  IImagawayakiReportInventory,
  ImagawayakiSales,
} from '@/types/ImagawayakiReport';
import { getImagawayakiTotalSales } from '@/lib/getImagawayakiTotalSales';
import { useEffect, useState } from 'react';
import { getSalesReportDetails } from '@/services/sales_reports.service';

interface Props {
  reportId: string;
}

export default function ImagawayakiReportDetails({ reportId }: Props) {
  const [report, setReport] = useState<IImagawayakiReport | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchReport() {
    try {
      const res = await getSalesReportDetails(reportId || '');
      setReport(res);
    } catch (error) {
      console.error('Failed to fetch report:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading) return <>Loading report....</>;

  if (!report) return <>Report not found</>;

  const totalExpenses = report.expenses.reduce(
    (partialSum, a) => partialSum + (a.value || 0),
    0,
  );

  const totalRemit = getImagawayakiTotalSales(report.sales) - totalExpenses;
  const cash = report.cash;

  return (
    <>
      <h1 className="font-bold text-2xl mt-5">{report.title}</h1>

      {/** Sales Section */}
      <div>
        <div className="mt-5 flex flex-col gap-3">
          {Object.entries(IMAGAWAYAKI_PRODUCTS).map(([key]) => (
            <div className="flex flex-row gap-3" key={key}>
              <div className="w-30">{IMAGAWAYAKI_PRODUCTS[key].name}</div>
              <div className="font-bold w-10">
                {report.sales[key.toLowerCase() as keyof ImagawayakiSales]}
              </div>
              <div>X</div>
              <div className="w-10">{IMAGAWAYAKI_PRODUCTS[key].price}</div>
              <div>=</div>
              <span className="font-bold">
                ₱
                {(
                  (report.sales[
                    IMAGAWAYAKI_PRODUCTS[key]
                      .attribute as keyof ImagawayakiSales
                  ] ?? 0) * IMAGAWAYAKI_PRODUCTS[key].price!
                ).toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <h5 className="font-bold text-3xl">
            Total Sales:{' '}
            {getImagawayakiTotalSales(report.sales).toLocaleString()}
          </h5>
        </div>
      </div>

      <Divider />

      {/** Expenses Section */}
      <div>
        <h2 className="text-xl font-bold">Expenses</h2>
        <div className="mt-3">
          {report.expenses.map((expense) => (
            <div className="flex flex-row gap-3" key={expense.id}>
              <div>{expense.name}</div>
              <div>=</div>
              <div className="font-bold">{expense.value.toLocaleString()}</div>
            </div>
          ))}
        </div>
        <div className="mt-5">
          <h4 className="font-bold text-lg">
            TOTAL EXPENSES: {totalExpenses.toLocaleString()}
          </h4>
        </div>
      </div>

      {/** Summary Section */}

      <div className="mt-5">
        <h1 className="font-bold text-xl">Summary</h1>
        <div className="flex flex-col gap-3 mt-5">
          <div className="flex gap-3">
            <div>Cash</div>
            <div className="font-bold">{report.cash.toLocaleString()}</div>
          </div>
          <div className="flex gap-3">
            <div>Cash Fund</div>
            <div className="font-bold">{report.cash_fund.toLocaleString()}</div>
          </div>
          <div className="flex gap-3">
            <div>On Duty</div>
            <div className="font-bold">{report.on_duty}</div>
          </div>
          <div className="flex gap-3">
            <div>Prepared By</div>
            <div className="font-bold">{report.prepared_by}</div>
          </div>
        </div>
        <div className="mt-5">
          {totalRemit - cash > 0 && (
            <h1 className="text-red-500">SHORT: Php {totalRemit - cash}</h1>
          )}
          {cash - totalRemit > 0 && (
            <h1 className="text-green-500">OVER: Php {cash - totalRemit}</h1>
          )}
        </div>
      </div>

      {/** Inventory table */}
      <div className="overflow-x-auto mt-5 text-xs">
        <div className="min-w-max">
          <table className="table-auto w-full border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 bg-white z-10 border w-40 py-2">
                  Item
                </th>
                <th className="border w-30 py-2">Initial Stocks</th>
                <th className="border w-20 py-2">Delivered</th>
                <th className="border w-30 py-2">Pull-Out</th>
                <th className="border w-30 py-2">Sales</th>
                <th className="border w-30 py-2">Remaining Stocks</th>
                <th className="border px-4 py-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(report.inventory)
                .sort(
                  (a, b) =>
                    IMAGAWAYAKI_INVENTORY_DISPLAY_ORDER.indexOf(a) -
                    IMAGAWAYAKI_INVENTORY_DISPLAY_ORDER.indexOf(b),
                )
                .map((key: string) => (
                  <tr key={key}>
                    <td className="sticky left-0 bg-white z-10 border px-4 py-2">
                      {key.replace('_', ' ').toUpperCase()}
                    </td>
                    <td className="border px-4 py-2">
                      {
                        report.inventory[
                          key as keyof IImagawayakiReportInventory
                        ].initial_stocks
                      }
                    </td>
                    <td className="border px-4 py-2 w-30">
                      {
                        report.inventory[
                          key as keyof IImagawayakiReportInventory
                        ].delivered
                      }
                    </td>
                    <td className="border px-4 py-2">
                      {
                        report.inventory[
                          key as keyof IImagawayakiReportInventory
                        ].pull_out
                      }
                    </td>
                    <td className="border px-4 py-2">
                      {
                        report.inventory[
                          key as keyof IImagawayakiReportInventory
                        ].sales
                      }
                    </td>
                    <td className="border px-4 py-2">
                      {
                        report.inventory[
                          key as keyof IImagawayakiReportInventory
                        ].remaining_stocks
                      }
                    </td>
                    <td className="border px-4 py-2">
                      {
                        report.inventory[
                          key as keyof IImagawayakiReportInventory
                        ].notes
                      }
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
