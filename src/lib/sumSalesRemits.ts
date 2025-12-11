import { RemitSalesType } from '@/types/RemitReport';

export function sumSalesRemits(sales: RemitSalesType): number {
  return Object.values(sales || {})
    .flatMap((brand) => Object.values(brand || {}))
    .reduce((total: number, item) => total + (item.amount ?? 0), 0);
}
