import { useEscClose } from '@/hooks/useEscClose';
import {
  getRemitReportDetails,
  getYesterdayRemitReports,
} from '@/services/remit_reports.service';
import { IRemitReport } from '@/types/RemitReport';
import { IAssignment } from '@/types/User';
import { useEffect, useState } from 'react';
import { FaX } from 'react-icons/fa6';

interface Props {
  remitId: string;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

export default function RemitReportDetails({
  remitId,
  isOpen,
  setIsOpen,
}: Props) {
  const [remit, setRemit] = useState<IRemitReport | null>(null);
  const [comparison, setComparison] = useState<
    { branch_id: number; total_cash: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  async function init() {
    setLoading(true);
    await loadReport();
    setLoading(false);
  }
  async function loadReport() {
    try {
      const res = await getRemitReportDetails(remitId || '');
      setRemit(res);

      const res2 = await getYesterdayRemitReports(res.report_date);
      setComparison(res2.sales);
    } catch (error) {
      console.error('Failed to fetch report:', error);
    } finally {
      setLoading(false);
    }
  }

  function computeSalesPerAssignment(key: string) {
    if (!remit) return 0;
    let total = 0;
    const salesData = remit.sales[key as keyof typeof remit.sales];
    if (!salesData) return 0;
    Object.entries(salesData).forEach((item) => {
      const [, data] = item;
      total += data.amount;
    });
    return total;
  }

  function checkIfMatch(branchId: number, amount: number) {
    console.log('branch id', branchId, amount);
    if (!comparison || comparison.length === 0) return false;
    const record = comparison.find((c) => c.branch_id === branchId);
    console.log('record', record, amount);
    if (!record) return false;
    return record.total_cash === amount;
  }

  useEffect(() => {
    init();
  }, []);

  console.log('comparison', comparison);
  console.log('remit', remit);

  useEscClose(isOpen, () => setIsOpen(false));

  console.log('remit test', remit);

  if (!isOpen) return null;

  if (loading) return <>Loading report....</>;

  if (!remit) return <>Report not found</>;

  return (
    <div className="fixed inset-0 z-50 p-5 overflow-auto items-center justify-center bg-white">
      <div className="flex gap-3 justify-between items-center">
        <h1 className="font-bold text-2xl">{remit.title}</h1>
        <FaX className="cursor-pointer" onClick={() => setIsOpen(false)} />
      </div>
      <h2 className="text-lg font-bold mb-4">Remit Report Details</h2>

      <p className="mb-2">
        <strong>Title:</strong> {remit.title}
      </p>

      {Object.keys(remit.sales || {}).map((key: string) => (
        <div className="mb-2 space-y-3" key={key}>
          <strong>
            {(key.charAt(0).toUpperCase() + key.slice(1)) as IAssignment} Sales:
          </strong>{' '}
          <div>
            {Object.entries(
              remit.sales[key as keyof typeof remit.sales] || {},
            ).map((item) => {
              const [branchId, data] = item;
              return (
                <div key={branchId}>
                  {item[0]}: {data.amount.toLocaleString()}{' '}
                  <span>
                    {checkIfMatch(data.branchId, data.amount) ? '✅' : '❌'}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="font-bold mt-1 text-2xl">
            Total {key.charAt(0).toUpperCase() + key.slice(1)} Sales:{' '}
            {computeSalesPerAssignment(key)
              ? computeSalesPerAssignment(key).toLocaleString()
              : '0'}
          </div>
        </div>
      ))}

      {/** Add-Ons Section */}
      <div className="mt-5">
        <h3 className="text-lg font-bold mb-2">Add-Ons</h3>
        {remit.remit_add_ons && Object.keys(remit.remit_add_ons).length > 0 ? (
          <ul>
            {remit.remit_add_ons.map((item) => {
              return (
                <li key={item.id}>
                  {item.name}: {item.value.toLocaleString()}
                </li>
              );
            })}
          </ul>
        ) : (
          <p>No add-ons available.</p>
        )}
        <div className="font-bold mt-2">
          Total Add-Ons:{' '}
          {remit.totals?.add_ons ? remit.totals.add_ons.toLocaleString() : '0'}
        </div>
      </div>

      {/** Expenses Section */}
      <div className="mt-5">
        <h3 className="text-lg font-bold mb-2">Expenses</h3>
        {remit.remit_expenses &&
        Object.keys(remit.remit_expenses).length > 0 ? (
          <ul>
            {remit.remit_expenses.map((item) => {
              return (
                <li key={item.id}>
                  {item.name}: {item.value.toLocaleString()}
                </li>
              );
            })}
          </ul>
        ) : (
          <p>No add-ons available.</p>
        )}

        <div className="font-bold mt-2">
          Total Expenses:{' '}
          {remit.totals?.expenses
            ? remit.totals.expenses.toLocaleString()
            : '0'}
        </div>
      </div>

      <h1 className="font-bold text-2xl mt-5">
        Total Remit: {remit.totals?.remit_total.toLocaleString()}
      </h1>
    </div>
  );
}
