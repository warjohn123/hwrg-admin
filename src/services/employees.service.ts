export async function getEmployees(
  page?: number,
  limit?: number,
  search?: string,
) {
  try {
    const params = new URLSearchParams();
    if (page) params.set('page', page.toString());
    if (limit) params.set('limit', limit.toString());
    if (search) params.set('search', search);

    const res = await fetch(`/api/users?${params.toString()}`);
    return res.json();
  } catch (e) {
    console.error(e);
  }
}
