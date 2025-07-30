import { IMAGAWAYAKI_PRODUCTS } from '@/constants/ImagawayakiProduct';
import { ImagawayakiSales } from '@/types/ImagawayakiReport';

export function getImagawayakiTotalSales(sales: ImagawayakiSales) {
  const totalSales =
    sales.chocolate * IMAGAWAYAKI_PRODUCTS.CHOCOLATE.price +
    sales.oreo * IMAGAWAYAKI_PRODUCTS.OREO.price +
    sales.cheese * IMAGAWAYAKI_PRODUCTS.CHEESE.price +
    sales.custard * IMAGAWAYAKI_PRODUCTS.CUSTARD.price +
    sales.plain * IMAGAWAYAKI_PRODUCTS.PLAIN.price +
    sales.juice * IMAGAWAYAKI_PRODUCTS.JUICE.price +
    sales.mineral_water * IMAGAWAYAKI_PRODUCTS.MINERAL_WATER.price +
    sales.minute_maid * IMAGAWAYAKI_PRODUCTS.MINUTE_MAID.price;

  return totalSales;
}
