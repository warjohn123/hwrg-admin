"use client";

import TimelogModal from "@/components/modals/TimelogModal";
import Pagination from "@/components/Pagination";
import { usePagination } from "@/hooks/usePagination";
import { formateDate } from "@/lib/formatDate";
import { getHoursRendered } from "@/lib/getHoursRendered";
import { ITimelog } from "@/types/Timelog";
import { useEffect, useState } from "react";

export default function TimeLogsPage() {
  const [timelogs, setTimelogs] = useState<ITimelog[]>([]);
  const [loading, setLoading] = useState(true);
  const { page, setPage, totalPages, setTotal, pageSize } = usePagination();
  const [selectedTimelog, setSelectedTimelog] = useState<ITimelog | undefined>(
    undefined
  );

  useEffect(() => {
    fetchTimelogs(page);
  }, [page]);

  function fetchTimelogs(pageNumber = 1) {
    fetch(`/api/timelogs?page=${pageNumber}&limit=${pageSize}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("data", data);
        setTotal(data.total);
        setTimelogs(data.timelogs);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch timelogs:", err);
        setLoading(false);
      });
  }

  if (loading) return <p>Loading timelogs...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Timelogs</h2>
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
                <td className="px-6 py-4">{formateDate(timelog.clock_in)}</td>
                <td className="px-6 py-4">{formateDate(timelog.clock_out)}</td>
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
