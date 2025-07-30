import { CHICKY_OINK_INVENTORY } from '@/constants/ChickyOinkInventory';
import { ChickyOinkSales } from '@/types/ChickyOinkReport';

export function getChickyOinkTotalSales(sales: ChickyOinkSales) {
  const totalSales =
    sales.regular_chicken * CHICKY_OINK_INVENTORY.REGULAR_CHICKEN.price +
    sales.spicy_chicken * CHICKY_OINK_INVENTORY.SPICY_CHICKEN.price +
    sales.regular_liempo * CHICKY_OINK_INVENTORY.REGULAR_LIEMPO.price +
    sales.spicy_liempo * CHICKY_OINK_INVENTORY.SPICY_LIEMPO.price +
    sales.liog * CHICKY_OINK_INVENTORY.LIOG.price +
    sales.spicy_liog * CHICKY_OINK_INVENTORY.SPICY_LIOG.price +
    sales.poso * CHICKY_OINK_INVENTORY.POSO.price +
    sales.atchara_small * CHICKY_OINK_INVENTORY.ATCHARA_SMALL.price +
    sales.atchara_big * CHICKY_OINK_INVENTORY.ATCHARA_BIG.price;

  return totalSales;
}
