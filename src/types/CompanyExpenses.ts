import { IBranch } from './Branch';

export type CompanyName = 'Chicky Oink' | 'Imagawayaki' | 'PotatoFry';

export interface ICompanyExpense {
  id: number;
  branch_id: number;
  type?: CompanyName;
  date: string;
  name: string;
  amount: number;
  expense_date: string;
  notes: string;
  created_at?: string;
  branches?: IBranch;
}
