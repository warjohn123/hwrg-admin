import { DateTime } from 'luxon';

export const formatDate = (date: string) => {
  if (!date) return '';

  return DateTime.fromISO(date + 'Z', { zone: 'Asia/Manila' }).toFormat(
    'yyyy-MM-dd HH:mm a',
  );
};
