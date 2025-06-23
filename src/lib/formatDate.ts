import { format } from "date-fns";

export const formateDate = (date: string) => {
  if (!date) return "";
  return format(new Date(date), "yyyy-MM-dd hh:mm a");
};
