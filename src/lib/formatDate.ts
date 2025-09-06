import { DateTime } from 'luxon';

export const formatDate = (date: string) => {
  if (!date) return '';

  return DateTime.fromISO(date).toFormat('yyyy-MM-dd HH:mm a');
};
