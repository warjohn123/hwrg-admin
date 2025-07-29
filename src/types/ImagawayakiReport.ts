import type { SalesReport } from './SalesReport';

export interface IImagawayakiReport extends SalesReport {
  sales: ImagawayakiSales;
  inventory: IImagawayakiReportInventory;
}

export interface ImagawayakiSales {
  chocolate: number;
  oreo: number;
  cheese: number;
  custard: number;
  plain: number;
  juice: number;
  mineral_water: number;
  minute_maid: number;
}

export interface IImagawayakiInventoryFormat {
  initial_stocks: string | number;
  delivered: string | number;
  pull_out: string | number;
  sales: string | number;
  remaining_stocks: string | number;
  notes: string;
}

export interface IImagawayakiReportInventory {
  [key: string]: IImagawayakiInventoryFormat;
}
