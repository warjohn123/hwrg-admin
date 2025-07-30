export type CompanyName = 'Chicky Oink' | 'Imagawayaki' | 'PotatoFry';

export interface ICompanyExpense {
  id: number;
  branch_id: number;
  type?: CompanyName;
  date: string;
  name: string;
  amount: number;
  created_at?: string;
}
