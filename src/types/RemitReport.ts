import { IAssignment } from './User';

export type RemitSalesType = {
  [K in IAssignment]: Record<string, { branchId: number; amount: number }>;
};

export interface IRemitReport {
  id: string;
  title: string;
  report_date: string;
  sales: RemitSalesType;
  remit_expenses: [{ [value: string]: number }];
  remit_add_ons: [{ [value: string]: number }];
  totals?: {
    sales: number;
    expenses: number;
    add_ons: number;
    remit_total: number;
  };
}
