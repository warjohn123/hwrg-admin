export async function getSalesReportDetails(id: string) {
  try {
    const res = await fetch(`/api/sales-reports/${id}`);
    return res.json();
  } catch (e) {
    console.error(e);
  }
}
