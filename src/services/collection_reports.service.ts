export async function fetchCollectionReports(
  page: number,
  limit: number,
  dates: string[],
) {
  const params = new URLSearchParams();

  params.set('page', page.toString());
  params.set('limit', limit.toString());
  if (dates?.length === 2) {
    params.set('dates', dates.join(','));
  }

  const res = await fetch(`/api/collection-reports?${params.toString()}`);
  return res.json();
}

export async function deleteCollectionReport(id: number) {
  const res = await fetch(`/api/collection-reports/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}
