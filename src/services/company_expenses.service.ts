import { ICompanyExpense } from '@/types/CompanyExpenses';
import { IAssignment } from '@/types/User';

export async function fetchCompanyExpenses(
  dates: string[],
  type: IAssignment,
  branchId?: string,
  page?: number,
  limit?: number,
  search?: string,
) {
  const params = new URLSearchParams();

  if (page) params.set('page', page.toString());
  if (limit) params.set('limit', limit.toString());
  if (dates?.length === 2) {
    params.set('dates', dates.join(','));
  }
  params.set('type', type);
  if (branchId) {
    params.set('branch_id', branchId);
  }
  if (search) {
    params.set('search', search);
  }

  const res = await fetch(`/api/company_expenses?${params.toString()}`);
  return res.json();
}

export async function deleteCompanyExpense(id: number) {
  const res = await fetch(`/api/company_expenses/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}

export async function createCompanyExpense(expense: ICompanyExpense) {
  try {
    const res = await fetch(`/api/company_expenses/add`, {
      method: 'POST',
      body: JSON.stringify(expense),
    });

    if (!res.ok) {
      throw new Error('Failed to create expense');
    }
    return res.json();
  } catch (e) {
    console.error(e);
    throw new Error('Failed to create expense');
  }
}

export async function updateCompanyExpense(
  id: number,
  expense: ICompanyExpense,
) {
  const res = await fetch(`/api/company_expenses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(expense),
  });
  return res.json();
}
