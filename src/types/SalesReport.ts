import type { IAssignment } from './User';

export interface IExpense {
  id?: number;
  sales_report_id?: number;
  name: string;
  value: number;
}

export interface IInventoryFormat {
  initial_stocks: number;
  delivered: number;
  pull_out: number;
  sales: number;
  remaining_stocks: number;
  notes: string;
}

export interface SalesReport {
  id?: string;
  title: string;
  report_date: string;
  cash: number;
  cash_fund: number;
  on_duty: string;
  prepared_by: string;
  type: IAssignment;
  expenses: IExpense[];
  branch_id: number; //FK to branches table
  user_id: string; //FK to users table
}
