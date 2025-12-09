import { HWRG_EGGS_PRODUCTS } from '@/constants/HWRGEggsInventory';
import { IHWRGEggsSales } from '@/types/HWRGEggsReport';

export function getHWRGEggsTotalSales(sales: IHWRGEggsSales) {
  const totalSales =
    sales.pw.trays * HWRG_EGGS_PRODUCTS.PW.trayPrice +
    sales.pw.dozens * HWRG_EGGS_PRODUCTS.PW.dozenPrice +
    sales.pw.pcs * HWRG_EGGS_PRODUCTS.PW.pcPrice +
    sales.pl.trays * HWRG_EGGS_PRODUCTS.PL.trayPrice +
    sales.pl.dozens * HWRG_EGGS_PRODUCTS.PL.dozenPrice +
    sales.pl.pcs * HWRG_EGGS_PRODUCTS.PL.pcPrice +
    sales.small.trays * HWRG_EGGS_PRODUCTS.SMALL.trayPrice +
    sales.small.dozens * HWRG_EGGS_PRODUCTS.SMALL.dozenPrice +
    sales.small.pcs * HWRG_EGGS_PRODUCTS.SMALL.pcPrice +
    sales.medium.trays * HWRG_EGGS_PRODUCTS.MEDIUM.trayPrice +
    sales.medium.dozens * HWRG_EGGS_PRODUCTS.MEDIUM.dozenPrice +
    sales.medium.pcs * HWRG_EGGS_PRODUCTS.MEDIUM.pcPrice +
    sales.large.trays * HWRG_EGGS_PRODUCTS.LARGE.trayPrice +
    sales.large.dozens * HWRG_EGGS_PRODUCTS.LARGE.dozenPrice +
    sales.large.pcs * HWRG_EGGS_PRODUCTS.LARGE.pcPrice +
    sales.xl.trays * HWRG_EGGS_PRODUCTS.XL.trayPrice +
    sales.xl.dozens * HWRG_EGGS_PRODUCTS.XL.dozenPrice +
    sales.xl.pcs * HWRG_EGGS_PRODUCTS.XL.pcPrice +
    sales.jumbo.trays * HWRG_EGGS_PRODUCTS.JUMBO.trayPrice +
    sales.jumbo.dozens * HWRG_EGGS_PRODUCTS.JUMBO.dozenPrice +
    sales.jumbo.pcs * HWRG_EGGS_PRODUCTS.JUMBO.pcPrice;

  return totalSales;
}
