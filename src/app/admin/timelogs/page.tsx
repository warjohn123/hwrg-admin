"use client";

import TimelogModal from "@/components/modals/TimelogModal";
import { formateDate } from "@/lib/formatDate";
import { ITimelog } from "@/types/Timelog";
import { useEffect, useState } from "react";

export default function TimeLogsPage() {
  const [timelogs, setTimelogs] = useState<ITimelog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedTimelog, setSelectedTimelog] = useState<ITimelog | undefined>(
    undefined
  );
  const pageSize = 5;

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

  const totalPages = Math.ceil(total / pageSize);

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

      <div className="flex justify-center mt-6 space-x-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          disabled={page === 1}
        >
          Prev
        </button>
        <span className="px-4 py-2 text-sm font-medium">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
