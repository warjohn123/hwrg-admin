import { DateTime } from "luxon";

export const formateDate = (date: string) => {
  if (!date) return "";

  return DateTime.fromISO(date + "Z", { zone: "Asia/Manila" }).toFormat(
    "yyyy-MM-dd HH:mm a"
  );
};
