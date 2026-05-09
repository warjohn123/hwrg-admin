'use client';

import Pagination from '@/components/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { fetchLeaveRequests } from '@/services/leave_requests.service';
import {
  ILeaveRequest,
  LeaveRequestStatus,
  LeaveType,
} from '@/types/LeaveRequest';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { useEffect, useState } from 'react';

const STATUS_OPTIONS = ['', ...Object.values(LeaveRequestStatus)];
const LEAVE_TYPE_OPTIONS = ['', ...Object.values(LeaveType)];

function SortIcon({
  field,
  sortField,
  sortDirection,
}: {
  field: string;
  sortField: string;
  sortDirection: 'asc' | 'desc';
}) {
  if (sortField !== field)
    return <ChevronsUpDown size={14} className="inline ml-1 text-gray-400" />;
  return sortDirection === 'asc' ? (
    <ChevronUp size={14} className="inline ml-1" />
  ) : (
    <ChevronDown size={14} className="inline ml-1" />
  );
}

function StatusBadge({ status }: { status: LeaveRequestStatus }) {
  const classes: Record<LeaveRequestStatus, string> = {
    [LeaveRequestStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
    [LeaveRequestStatus.APPROVED]: 'bg-green-100 text-green-800',
    [LeaveRequestStatus.REJECTED]: 'bg-red-100 text-red-800',
  };
  return (
    <span
      className={`px-2 py-1 rounded text-xs font-semibold ${classes[status] ?? ''}`}
    >
      {status}
    </span>
  );
}

export default function LeaveRequestsPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const { page, setPage, totalPages, setTotal, limit } = usePagination();

  const { data, isPending, error } = useQuery({
    queryKey: [
      'leave-requests',
      page,
      limit,
      debouncedSearch,
      status,
      leaveType,
      sortField,
      sortDirection,
    ],
    queryFn: () =>
      fetchLeaveRequests(
        page,
        limit,
        debouncedSearch,
        status,
        leaveType,
        sortField,
        sortDirection,
      ),
  });

  useEffect(() => {
    if (data?.total !== undefined) setTotal(data.total);
  }, [data, setTotal]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setPage(1);
  };

  if (error) return <p>Error loading leave requests: {error.message}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Leave Requests</h2>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-5">
        <div>
          <label className="block text-sm mb-1">Search by Employee</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name"
            className="px-4 py-2 border border-gray-300 w-56 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s || 'All Statuses'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Leave Type</label>
          <select
            value={leaveType}
            onChange={(e) => {
              setLeaveType(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {LEAVE_TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t || 'All Types'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isPending && <p>Loading leave requests...</p>}
      {!isPending && (
        <>
          <div className="overflow-x-auto bg-white rounded shadow">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-6 py-3 text-sm font-medium">Employee</th>
                  <th
                    className="px-6 py-3 text-sm font-medium cursor-pointer select-none"
                    onClick={() => toggleSort('leave_type')}
                  >
                    Leave Type
                    <SortIcon
                      field="leave_type"
                      sortField={sortField}
                      sortDirection={sortDirection}
                    />
                  </th>
                  <th
                    className="px-6 py-3 text-sm font-medium cursor-pointer select-none"
                    onClick={() => toggleSort('date_from')}
                  >
                    Date From
                    <SortIcon
                      field="date_from"
                      sortField={sortField}
                      sortDirection={sortDirection}
                    />
                  </th>
                  <th
                    className="px-6 py-3 text-sm font-medium cursor-pointer select-none"
                    onClick={() => toggleSort('date_to')}
                  >
                    Date To
                    <SortIcon
                      field="date_to"
                      sortField={sortField}
                      sortDirection={sortDirection}
                    />
                  </th>
                  <th className="px-6 py-3 text-sm font-medium">Reason</th>
                  <th
                    className="px-6 py-3 text-sm font-medium cursor-pointer select-none"
                    onClick={() => toggleSort('status')}
                  >
                    Status
                    <SortIcon
                      field="status"
                      sortField={sortField}
                      sortDirection={sortDirection}
                    />
                  </th>
                  <th
                    className="px-6 py-3 text-sm font-medium cursor-pointer select-none"
                    onClick={() => toggleSort('created_at')}
                  >
                    Created At
                    <SortIcon
                      field="created_at"
                      sortField={sortField}
                      sortDirection={sortDirection}
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                {data?.leave_requests?.map(
                  (lr: ILeaveRequest & { users?: { name: string } }) => (
                    <tr key={lr.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">{lr.users?.name ?? '—'}</td>
                      <td className="px-6 py-4">{lr.leave_type}</td>
                      <td className="px-6 py-4">
                        {lr.date_from
                          ? new Date(lr.date_from).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="px-6 py-4">
                        {lr.date_to
                          ? new Date(lr.date_to).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate">
                        {lr.reason}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={lr.status} />
                      </td>
                      <td className="px-6 py-4">
                        {lr.created_at
                          ? new Date(lr.created_at).toLocaleDateString()
                          : '—'}
                      </td>
                    </tr>
                  ),
                )}
                {!data?.leave_requests?.length && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No leave requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination setPage={setPage} page={page} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}
