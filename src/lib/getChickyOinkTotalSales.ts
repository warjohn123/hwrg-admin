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
    sales.atchara_big * CHICKY_OINK_INVENTORY.ATCHARA_BIG.price +
    (sales?.coke ? sales.coke * CHICKY_OINK_INVENTORY.COKE.price : 0) +
    (sales?.royal ? sales.royal * CHICKY_OINK_INVENTORY.ROYAL.price : 0) +
    (sales?.sprite ? sales.sprite * CHICKY_OINK_INVENTORY.SPRITE.price : 0) +
    (sales?.mineral_water ? sales.mineral_water * CHICKY_OINK_INVENTORY.MINERAL_WATER.price : 0);

  return totalSales;
}
