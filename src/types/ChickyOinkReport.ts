import { IInventoryFormat, SalesReport } from './SalesReport';

export interface IChickyOinkReport extends SalesReport {
  sales: ChickyOinkSales;
  inventory: IChickyOinkReportInventory;
}

export interface ChickyOinkSales {
  regular_chicken: number;
  spicy_chicken: number;
  regular_liempo: number;
  spicy_liempo: number;
  liog: number;
  spicy_liog: number;
  poso: number;
  atchara_small: number;
  atchara_big: number;
  coke: number;
  royal: number;
  sprite: number;
  mineral_water: number;
  uling: number;
}

export interface IChickyOinkReportInventory {
  regular_chicken: IInventoryFormat;
  spicy_chicken: IInventoryFormat;
  regular_liempo: IInventoryFormat;
  spicy_liempo: IInventoryFormat;
  liog: IInventoryFormat;
  spicy_liog: IInventoryFormat;
  poso: IInventoryFormat;
  atchara_small: IInventoryFormat;
  atchara_big: IInventoryFormat;
  coke: IInventoryFormat;
  royal: IInventoryFormat;
  sprite: IInventoryFormat;
  mineral_water: IInventoryFormat;
  uling: IInventoryFormat;
}
