'use client';

import Pagination from '@/components/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { formatDate } from '@/lib/formatDate';
import { fetchBranches } from '@/services/branch.service';
import { fetchCommissions } from '@/services/commissions.service';
import { IBranch } from '@/types/Branch';
import { ICommission } from '@/types/Commission';
import { IAssignment } from '@/types/User';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import DatePicker, { DateObject } from 'react-multi-date-picker';

export default function CommissionsPage() {
  const [branches, setBranches] = useState<IBranch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const { page, setPage, limit, setTotal, totalPages, setLimit } =
    usePagination();
  const [dates, setDates] = useState([new DateObject(), new DateObject()]);

  const { data, error, isPending } = useQuery({
    queryKey: ['chicky-oink-commissions', page, limit, selectedBranch, dates],
    queryFn: () =>
      fetchCommissions(
        selectedBranch,
        dates.map((date) => date.format('YYYY-MM-DD')),
        IAssignment.CHICKY_OINK,
        page,
        limit,
      ),
    enabled: dates.length === 2,
  });

  const commissions: ICommission[] = data?.commissions ?? [];
  const isReady = dates.length === 2;
  const isLoadingInitial = isReady && isPending;

  useEffect(() => {
    getBranches();
  }, []);

  useEffect(() => {
    if (data?.total != null) {
      setTotal(data.total);
    }
  }, [data?.total, setTotal]);

  async function getBranches() {
    const res = await fetchBranches(IAssignment.CHICKY_OINK);
    setBranches(res.branches);
  }

  const totalCommission = commissions.reduce(
    (acc, commission) => acc + Number(commission.amount || 0),
    0,
  );

  if (isLoadingInitial) return <p>Loading commissions...</p>;
  if (error) return <p>Error loading commissions: {error.message}</p>;

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
        <p className="font-bold">
          Total Commission: {totalCommission.toLocaleString()}
        </p>
      </div>
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-6 py-3 text-sm font-medium">Date</th>
              <th className="px-6 py-3 text-sm font-medium">Commission Amount</th>
              <th className="px-6 py-3 text-sm font-medium">On Duty</th>
            </tr>
          </thead>
          <tbody>
            {commissions.map((commission) => (
              <tr key={commission.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{formatDate(commission.date)}</td>
                <td className="px-6 py-4">
                  {Number(commission.amount).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  {commission.sales_reports?.on_duty}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
