export async function getSalesReportDetails(id: string) {
  try {
    const res = await fetch(`/api/sales-reports/${id}`);
    return res.json();
  } catch (e) {
    console.error(e);
  }
}

export async function fetchSalesReports(
  page: number,
  limit: number,
  branchId = '',
  dates: string[],
) {
  const params = new URLSearchParams();

  params.set('page', page.toString());
  params.set('limit', limit.toString());
  if (branchId) params.set('branchId', branchId);
  if (dates?.length === 2) {
    params.set('dates', dates.join(','));
  }

  const res = await fetch(`/api/sales-reports?${params.toString()}`);
  return res.json();
}

export async function deleteSalesReport(id: string) {
  const res = await fetch(`/api/sales-reports/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}
