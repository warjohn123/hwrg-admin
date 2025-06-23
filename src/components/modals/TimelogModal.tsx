"use client";

import { formateDate } from "@/lib/formatDate";
import { supabase } from "@/lib/supabase";
import { ITimelog } from "@/types/Timelog";
import { Dialog } from "@headlessui/react";

interface ClockLogModalProps {
  isOpen: boolean;
  setSelectedTimelog: (val: ITimelog | undefined) => void;
  timelog: ITimelog | undefined;
}

export default function TimelogModal({
  isOpen,
  timelog,
  setSelectedTimelog,
}: ClockLogModalProps) {
  if (!timelog) return <></>;

  const clockInImage = supabase.storage
    .from("timelog-photos")
    .getPublicUrl(timelog.clock_in_photo).data.publicUrl;

  const clockOutImage = supabase.storage
    .from("timelog-photos")
    .getPublicUrl(timelog.clock_out_photo).data.publicUrl;

  console.log("clockInImage", clockInImage);

  return (
    <Dialog
      open={isOpen}
      onClose={() => setSelectedTimelog(undefined)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <Dialog.Panel className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
        <Dialog.Title className="text-xl font-bold mb-4 text-center">
          Time Log Details - {timelog.users?.name}
        </Dialog.Title>

        <div className="space-y-4">
          <div>
            <p className="font-semibold text-gray-700">🕒 Clock In</p>
            <p className="text-sm text-gray-600 mb-2">
              {formateDate(timelog.clock_in)}
            </p>
            <img
              src={clockInImage}
              alt="Clock In Photo"
              className="w-full h-48 object-cover rounded-md border"
            />
          </div>

          <div className="border-t pt-4">
            <p className="font-semibold text-gray-700">🕔 Clock Out</p>
            <p className="text-sm text-gray-600 mb-2">
              {formateDate(timelog.clock_out)}
            </p>
            {clockOutImage ? (
              <img
                src={clockOutImage}
                alt="Clock Out Photo"
                className="w-full h-48 object-cover rounded-md border"
              />
            ) : (
              <div className="w-full h-48 flex items-center justify-center border rounded-md text-gray-400">
                No photo
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => setSelectedTimelog(undefined)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Close
          </button>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
}
