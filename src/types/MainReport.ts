interface IExpense {
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

export interface MainReport {
  id: string;
  title: string;
  date: string;
  cash: number;
  cash_fund: number;
  total_remit: number;
  short: number;
  over: number;
  on_duty: string;
  prepared_by: string;
  expenses: IExpense;
}
