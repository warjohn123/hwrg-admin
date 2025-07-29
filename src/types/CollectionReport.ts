export interface ICollectionReport {
  id: number;
  date: string;
  branch_sales: ICollectionBranchSales;
  add_ons: ICollectionBranchAdjustment[];
  expenses: ICollectionBranchAdjustment[];
}

interface ICollectionBranchSales {
  [key: string]: number;
}

interface ICollectionBranchAdjustment {
  [key: string]: number;
}
