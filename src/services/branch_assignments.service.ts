export async function assignBranch(
  user_id: string,
  branch_id: string,
  action: 'add' | 'remove',
) {
  try {
    const res = await fetch(
      `/api/branches/${branch_id}/assignments/${action}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch_id,
          user_id,
        }),
      },
    );

    return res;
  } catch (e) {
    console.error(e);
  }
}
