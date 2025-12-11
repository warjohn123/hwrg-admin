import { IAssignment } from './User';

export type RemitSalesType = {
  [K in IAssignment]: Record<string, { branchId: number; amount: number }>;
};

export interface IRemitReport {
  id: string;
  title: string;
  report_date: string;
  sales?: [{ [branchId: number]: number }];
  expenses?: [{ [value: string]: number }];
  add_ons?: [{ [value: string]: number }];
}
