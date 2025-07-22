import { DISPLAY_ORDER } from '@/constants/displayOrder';
import Divider from './UI/Divider';
import { CHICKY_OINK_INVENTORY } from '@/constants/ChickyOinkInventory';
import {
  ChickyOinkSales,
  IChickyOinkReport,
  IChickyOinkReportInventory,
} from '@/types/ChickyOinkReport';

interface Props {
  report: IChickyOinkReport;
}

function getTotalSales(sales: ChickyOinkSales) {
  const totalSales =
    sales.regular_chicken * CHICKY_OINK_INVENTORY.REGULAR_CHICKEN.price +
    sales.spicy_chicken * CHICKY_OINK_INVENTORY.SPICY_CHICKEN.price +
    sales.regular_liempo * CHICKY_OINK_INVENTORY.REGULAR_LIEMPO.price +
    sales.spicy_liempo * CHICKY_OINK_INVENTORY.SPICY_LIEMPO.price +
    sales.liog * CHICKY_OINK_INVENTORY.LIOG.price +
    sales.spicy_liog * CHICKY_OINK_INVENTORY.SPICY_LIOG.price +
    sales.poso * CHICKY_OINK_INVENTORY.POSO.price +
    sales.atchara_small * CHICKY_OINK_INVENTORY.ATCHARA_SMALL.price +
    sales.atchara_big * CHICKY_OINK_INVENTORY.ATCHARA_BIG.price;

  return totalSales;
}

export default function ChickyOinkReportDetails({ report }: Props) {
  const totalExpenses = report.expenses.reduce(
    (partialSum, a) => partialSum + (a.value || 0),
    0,
  );

  const totalRemit = getTotalSales(report.sales) - totalExpenses;
  const cash = report.cash;

  return (
    <div className="p-5">
      <h1 className="font-bold text-2xl mt-5">{report.title}</h1>

      {/** Sales Section */}
      <div>
        <div className="mt-5 flex flex-col gap-3">
          {Object.entries(CHICKY_OINK_INVENTORY).map(([key]) => (
            <div className="flex flex-row gap-3" key={key}>
              <div className="w-30">{CHICKY_OINK_INVENTORY[key].name}</div>
              <div className="font-bold w-10">
                {report.sales[key.toLowerCase() as keyof ChickyOinkSales]}
              </div>
              <div>X</div>
              <div className="w-10">{CHICKY_OINK_INVENTORY[key].price}</div>
              <div>=</div>
              <span className="font-bold">
                ₱
                {(
                  (report.sales[CHICKY_OINK_INVENTORY[key].attribute] ?? 0) *
                  CHICKY_OINK_INVENTORY[key].price!
                ).toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <h5 className="font-bold text-3xl">
            Total Sales: {getTotalSales(report.sales).toLocaleString()}
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
                  (a, b) => DISPLAY_ORDER.indexOf(a) - DISPLAY_ORDER.indexOf(b),
                )
                .map((key: string) => (
                  <tr key={key}>
                    <td className="sticky left-0 bg-white z-10 border px-4 py-2">
                      {key.replace('_', ' ').toUpperCase()}
                    </td>
                    <td className="border px-4 py-2">
                      {
                        report.inventory[
                          key as keyof IChickyOinkReportInventory
                        ].initial_stocks
                      }
                    </td>
                    <td className="border px-4 py-2 w-30">
                      {
                        report.inventory[
                          key as keyof IChickyOinkReportInventory
                        ].delivered
                      }
                    </td>
                    <td className="border px-4 py-2">
                      {
                        report.inventory[
                          key as keyof IChickyOinkReportInventory
                        ].pull_out
                      }
                    </td>
                    <td className="border px-4 py-2">
                      {
                        report.inventory[
                          key as keyof IChickyOinkReportInventory
                        ].sales
                      }
                    </td>
                    <td className="border px-4 py-2">
                      {
                        report.inventory[
                          key as keyof IChickyOinkReportInventory
                        ].remaining_stocks
                      }
                    </td>
                    <td className="border px-4 py-2">
                      {
                        report.inventory[
                          key as keyof IChickyOinkReportInventory
                        ].notes
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
