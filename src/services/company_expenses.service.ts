import { ICompanyExpense } from '@/types/CompanyExpenses';
import { IAssignment } from '@/types/User';

export async function fetchCompanyExpenses(
  page: number,
  limit: number,
  dates: string[],
  type: IAssignment,
  branchId?: string,
) {
  const params = new URLSearchParams();

  params.set('page', page.toString());
  params.set('limit', limit.toString());
  if (dates?.length === 2) {
    params.set('dates', dates.join(','));
  }
  params.set('type', type);
  if (branchId) {
    params.set('branch_id', branchId);
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
  const res = await fetch(`/api/company_expenses/add`, {
    method: 'POST',
    body: JSON.stringify(expense),
  });
  return res.json();
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
