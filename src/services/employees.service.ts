export async function getEmployees() {
  try {
    const res = await fetch(`/api/users`);
    return res.json();
  } catch (e) {
    console.error(e);
  }
}
