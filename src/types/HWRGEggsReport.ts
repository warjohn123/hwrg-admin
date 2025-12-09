import type { SalesReport } from './SalesReport';

export interface IHWRGEggsReport extends SalesReport {
  sales: IHWRGEggsSales;
  inventory: IHWRGEggsReportInventory;
}

type SalesType = {
  trays: number;
  dozens: number;
  pcs: number;
};

export type HWRGEggsInventoryType = {
  trays: number;
  pcs: number;
};

export interface IHWRGEggsSales {
  pl: SalesType;
  pw: SalesType;
  small: SalesType;
  medium: SalesType;
  large: SalesType;
  xl: SalesType;
  jumbo: SalesType;
}

export interface IHWRGEggsInventoryFormat {
  initial_stocks: HWRGEggsInventoryType;
  delivered: { trays: number };
  pull_out: { trays: number };
  sales: SalesType;
  remaining_stocks: HWRGEggsInventoryType;
  notes: string;
}

export interface IHWRGEggsReportInventory {
  [key: string]: IHWRGEggsInventoryFormat;
}
