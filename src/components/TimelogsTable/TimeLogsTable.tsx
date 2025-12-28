'use client';

import { usePagination } from '@/hooks/usePagination';
import { ITimelog } from '@/types/Timelog';
import { useCallback, useEffect, useState } from 'react';
import { formatDate } from '@/lib/formatDate';
import { getHoursRendered } from '@/lib/getHoursRendered';
import TimelogModal from '../modals/TimelogModal';
import Pagination from '../Pagination';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import { fetchTimelogs } from '@/services/timelogs.service';

export default function TimeLogsTable() {
  const [timelogs, setTimelogs] = useState<ITimelog[]>([]);
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { page, setPage, totalPages, setTotal, limit } = usePagination();
  const [selectedTimelog, setSelectedTimelog] = useState<ITimelog | undefined>(
    undefined,
  );
  const [dates, setDates] = useState([new DateObject(), new DateObject()]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const formattedDates = dates.map((date) => date.format('YYYY-MM-DD'));
      const res = await fetchTimelogs(
        formattedDates,
        page,
        limit,
        debouncedSearch,
      );
      setTotal(res.total ?? 0);
      setTimelogs(res.timelogs ?? []);
      setLoading(false);
    } catch (e) {
      console.error(`Failed to fetch timelogs:`, e);
      setLoading(false);
    }
  }, [dates, page, limit, debouncedSearch, setTotal]);

  useEffect(() => {
    if (debouncedSearch !== undefined) fetchLogs();
  }, [page, debouncedSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // Debounce delay in ms

    return () => {
      clearTimeout(handler); // Cleanup if value changes
    };
  }, [search]);

  useEffect(() => {
    if (dates.length === 2) fetchLogs();
  }, [fetchLogs, dates]);

  if (loading) return <p>Loading timelogs...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Timelogs</h2>
      </div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-5">
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
          <div className="mb-5">
            <label>Search</label>
            <div>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search employee by name"
                className="px-4 py-2 border border-gray-300 w-64 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-6 py-3 text-sm font-medium">Employee</th>
              <th className="px-6 py-3 text-sm font-medium">Date</th>
              <th className="px-6 py-3 text-sm font-medium">Clock In</th>
              <th className="px-6 py-3 text-sm font-medium">Clock Out</th>
              <th className="px-6 py-3 text-sm font-medium">Hours Rendered</th>
            </tr>
          </thead>
          <tbody>
            {timelogs.map((timelog) => (
              <tr
                key={timelog.id}
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setSelectedTimelog(timelog);
                }}
              >
                <td className="px-6 py-4">{timelog.users?.name}</td>
                <td className="px-6 py-4">{timelog.date}</td>
                <td className="px-6 py-4">{formatDate(timelog.clock_in)}</td>
                <td className="px-6 py-4">{formatDate(timelog.clock_out)}</td>
                <td className="font-bold px-6 py-4">
                  {getHoursRendered(timelog.clock_in, timelog.clock_out)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <TimelogModal
          timelog={selectedTimelog}
          isOpen={Boolean(selectedTimelog)}
          setSelectedTimelog={setSelectedTimelog}
        />
      </div>

      <Pagination setPage={setPage} page={page} totalPages={totalPages} />
    </div>
  );
}
