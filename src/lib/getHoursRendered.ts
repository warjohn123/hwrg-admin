export function getHoursRendered(
  clockIn: string | Date,
  clockOut: string | Date
): number {
  if (!clockIn || !clockOut) return 0;
  const inTime = new Date(clockIn);
  const outTime = new Date(clockOut);

  const diffInMs = outTime.getTime() - inTime.getTime(); // difference in milliseconds
  const diffInHours = diffInMs / (1000 * 60 * 60); // convert to hours

  return parseFloat(diffInHours.toFixed(2)); // round to 2 decimal places
}
