import { POTATO_FRY_PRODUCTS } from '@/constants/PotatoFryProduct';
import { POTATOFRY_INVENTORY_DISPLAY_ORDER } from '@/constants/displayOrder';
import { getPotatoFryTotalSales } from '@/lib/getPotatoFryTotalSales';
import { getSalesReportDetails } from '@/services/sales_reports.service';
import {
  IPotatoFryInventoryFormat,
  IPotatoFryReport,
  PotatoFrySales,
} from '@/types/PotatoFryReport';
import { useEffect, useState } from 'react';
import { FaX } from 'react-icons/fa6';
import Divider from './UI/Divider';
import { useEscClose } from '@/hooks/useEscClose';

interface Props {
  reportId: string;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

export default function PotatoFryReportDetails({
  reportId,
  isOpen,
  setIsOpen,
}: Props) {
  const [report, setReport] = useState<IPotatoFryReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchReport();
  }, [reportId]);

  useEscClose(isOpen, () => setIsOpen(false));

  if (!isOpen) return null;

  if (loading) return <>Loading report....</>;

  if (!report) return <>Report not found</>;

  const totalExpenses = report.expenses.reduce(
    (partialSum, a) => partialSum + (a.value || 0),
    0,
  );

  const totalRemit = getPotatoFryTotalSales(report.sales) - totalExpenses;
  const cash = report.cash;

  return (
    <div className="fixed inset-0 z-50 p-5 overflow-auto items-center justify-center bg-white">
      <div className="flex gap-3 justify-between items-center">
        <h1 className="font-bold text-2xl mt-5">{report.title}</h1>
        <FaX className="cursor-pointer" onClick={() => setIsOpen(false)} />
      </div>

      {/** Sales Section */}
      <div>
        <div className="mt-5 flex flex-col gap-3">
          {Object.entries(POTATO_FRY_PRODUCTS).map(([key]) => (
            <div className="flex flex-row gap-3" key={key}>
              <div className="w-30">{POTATO_FRY_PRODUCTS[key].name}</div>
              <div className="font-bold w-10">
                {
                  report.sales[key.toLowerCase() as keyof PotatoFrySales]
                    ?.quantity
                }
              </div>
              <div>X</div>
              <div className="w-10">{POTATO_FRY_PRODUCTS[key].price}</div>
              <div>=</div>
              <span className="font-bold">
                ₱
                {(
                  (Number(
                    report.sales[
                      POTATO_FRY_PRODUCTS[key].attribute as keyof PotatoFrySales
                    ].quantity,
                  ) ?? 0) * POTATO_FRY_PRODUCTS[key].price!
                ).toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <h5 className="font-bold text-3xl">
            Total Sales: {getPotatoFryTotalSales(report.sales).toLocaleString()}
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
                    POTATOFRY_INVENTORY_DISPLAY_ORDER.indexOf(a) -
                    POTATOFRY_INVENTORY_DISPLAY_ORDER.indexOf(b),
                )
                .map((key: string) => (
                  <tr key={key}>
                    <td className="sticky left-0 bg-white z-10 border px-4 py-2">
                      {key.replace('_', ' ').toUpperCase()}
                    </td>
                    <td className="border px-4 py-2">
                      {
                        report.inventory[key as keyof IPotatoFryInventoryFormat]
                          .initial_stocks
                      }
                    </td>
                    <td className="border px-4 py-2 w-30">
                      {
                        report.inventory[key as keyof IPotatoFryInventoryFormat]
                          .delivered
                      }
                    </td>
                    <td className="border px-4 py-2">
                      {
                        report.inventory[key as keyof IPotatoFryInventoryFormat]
                          .pull_out
                      }
                    </td>
                    <td className="border px-4 py-2">
                      {
                        report.inventory[key as keyof IPotatoFryInventoryFormat]
                          .sales
                      }
                    </td>
                    <td className="border px-4 py-2">
                      {report.inventory[
                        key as keyof IPotatoFryInventoryFormat
                      ].remaining_stocks.toLocaleString()}{' '}
                      grams
                    </td>
                    <td className="border px-4 py-2">
                      {
                        report.inventory[key as keyof IPotatoFryInventoryFormat]
                          .notes
                      }
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
