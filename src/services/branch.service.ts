import { IBranch } from '@/types/Branch';

export async function createBranch(branch: IBranch) {
  try {
    const res = await fetch('/api/branches/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        branch_name: branch.branch_name,
        assignment: branch.assignment,
      }),
    });

    return res;
  } catch (e) {
    console.error(e);
  }
}

export async function updateBranch(branch: IBranch) {
  try {
    const res = await fetch(`/api/branches/${branch.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        branch_name: branch.branch_name,
        assignment: branch.assignment,
      }),
    });

    return res;
  } catch (e) {
    console.error(e);
  }
}
