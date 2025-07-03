import { IInventoryFormat, MainReport } from "./MainReport";

interface ImagawayakiSales {
  chocolate: number;
  oreo: number;
  cheese: number;
  custard: number;
  plain: number;
  juice: number;
  mineral_water: number;
}

interface IImagawayakiReportInventory {
  batter: IInventoryFormat;
  chocolate: IInventoryFormat;
  oreo: IInventoryFormat;
  cheese: IInventoryFormat;
  custard: IInventoryFormat;
  mineral_water: IInventoryFormat;
  paper_bag_1: IInventoryFormat;
  paper_bag_2: IInventoryFormat;
  box_1: IInventoryFormat;
  box_2: IInventoryFormat;
  plastic_bag: IInventoryFormat;
}

export interface IImagawayakiReport extends MainReport {
  sales: ImagawayakiSales;
  inventory: IImagawayakiReportInventory;
}
