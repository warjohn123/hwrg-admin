export async function getRemitReportDetails(id: string) {
  try {
    const res = await fetch(`/api/remit-reports/${id}`);
    return res.json();
  } catch (e) {
    console.error(e);
  }
}

export async function fetchRemitReports(
  dates: string[],
  page?: number,
  limit?: number,
) {
  const params = new URLSearchParams();

  if (page) params.set('page', page.toString());
  if (limit) params.set('limit', limit.toString());
  if (dates?.length === 2) {
    params.set('dates', dates.join(','));
  }

  const res = await fetch(`/api/remit-reports?${params.toString()}`);
  return res.json();
}

export async function deleteRemitReport(id: string) {
  const res = await fetch(`/api/remit-reports/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}
