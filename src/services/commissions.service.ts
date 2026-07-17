import { IAssignment } from '@/types/User';

export async function fetchCommissions(
  branchId = '',
  dates: string[],
  type?: IAssignment,
  page?: number,
  limit?: number,
) {
  const params = new URLSearchParams();

  if (page) params.set('page', page.toString());
  if (limit) params.set('limit', limit.toString());
  if (branchId) params.set('branchId', branchId);
  if (dates?.length === 2) {
    params.set('dates', dates.join(','));
  }
  if (type) params.set('type', type);

  const res = await fetch(`/api/commissions?${params.toString()}`);
  return res.json();
}
