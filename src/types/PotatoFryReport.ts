import { PotatoFrySize } from '@/lib/getPotatoFryTotalSales';
import type { SalesReport } from './SalesReport';

export interface IPotatoFryReport extends SalesReport {
  sales: PotatoFrySales;
  inventory: IPotatoFryReportInventory;
}

export type PotatoFrySales = Record<PotatoFrySize, { quantity: number }>;

export interface IPotatoFryInventoryFormat {
  initial_stocks: string | number;
  delivered: string | number;
  pull_out: string | number;
  sales: string | number;
  remaining_stocks: string | number;
  notes: string;
}

export interface IPotatoFryReportInventory {
  [key: string]: IPotatoFryInventoryFormat;
}
