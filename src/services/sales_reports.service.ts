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
) {
  try {
    const res = await fetch(
      `/api/sales-reports?page=${page}&limit=${limit}&branchId=${branchId}`,
    );
    return res.json();
  } catch (e) {
    console.error(e);
  }
}
