import { useEscClose } from '@/hooks/useEscClose';
import { getRemitReportDetails } from '@/services/remit_reports.service';
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
  const [loading, setLoading] = useState(true);
  async function loadReport() {
    try {
      const res = await getRemitReportDetails(remitId || '');
      setRemit(res);
    } catch (error) {
      console.error('Failed to fetch report:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReport();
  }, []);

  useEscClose(isOpen, () => setIsOpen(false));

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
        <div className="mb-2" key={key}>
          <strong>
            {(key.charAt(0).toUpperCase() + key.slice(1)) as IAssignment} Sales:
          </strong>{' '}
          <div>
            {Object.entries(
              remit.sales[key as keyof typeof remit.sales] || {},
            ).map((item) => {
              console.log('item', item);
              const [branchId, data] = item;
              return (
                <div key={branchId}>
                  {item[0]}: {data.amount.toLocaleString()}{' '}
                </div>
              );
            })}
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
      </div>

      <h1 className="font-bold text-2xl mt-5">
        Total Remit: {remit.totals?.remit_total.toLocaleString()}
      </h1>
    </div>
  );
}
