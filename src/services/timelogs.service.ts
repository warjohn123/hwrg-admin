export async function fetchTimelogs(
  dates: string[],
  pageNumber?: number,
  limit?: number,
  search?: string,
) {
  const params = new URLSearchParams();

  if (pageNumber) params.set('page', pageNumber.toString());
  if (limit) params.set('limit', limit.toString());
  if (search) params.set('search', search);

  if (dates?.length === 2) {
    params.set('dates', dates.join(','));
  }

  const res = await fetch(`/api/timelogs?${params.toString()}`);
  return res.json();
}
