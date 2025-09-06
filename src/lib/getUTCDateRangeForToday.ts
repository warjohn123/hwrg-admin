export default function getUTCDateRangeForToday(timeZone = 'Asia/Manila') {
  const now = new Date();

  // Convert to start of today in that timezone
  const startLocal = new Date(
    new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now),
  );

  // Force 00:00:00 local
  startLocal.setHours(0, 0, 0, 0);

  // End of today local
  const endLocal = new Date(startLocal);
  endLocal.setHours(23, 59, 59, 999);

  console.log('startLocal', startLocal);

  return {
    startUTC: new Date(startLocal.toISOString()),
    endUTC: new Date(endLocal.toISOString()),
  };
}
