import { IBranch } from '@/types/Branch';
import { IAssignment } from '@/types/User';

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

export async function getBranchDetails(id: string) {
  try {
    const res = await fetch(`/api/branches/${id}`);
    return res.json();
  } catch (e) {
    console.error(e);
  }
}

export async function fetchBranches(assignment?: IAssignment) {
  try {
    const res = await fetch(`/api/branches?assignment=${assignment}`);
    return res.json();
  } catch (e) {
    console.error(e);
  }
}

export async function fetchAssignedEmployeesByBranch(branchId: string) {
  try {
    const res = await fetch(`/api/branches/${branchId}/assignments`);
    return res.json();
  } catch (e) {
    console.error(e);
  }
}

export async function deleteBranch(id: string) {
  try {
    const res = await fetch(`/api/branches/${id}`, {
      method: 'DELETE',
    });

    return res;
  } catch (e) {
    console.error(e);
  }
}
