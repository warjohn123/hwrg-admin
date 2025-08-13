import { PotatoFrySales } from '@/types/PotatoFryReport';

const POTATO_FRY_SIZES = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
} as const;

export type PotatoFrySize =
  (typeof POTATO_FRY_SIZES)[keyof typeof POTATO_FRY_SIZES];

const POTATO_FRY_PRICES: Record<PotatoFrySize, number> = {
  [POTATO_FRY_SIZES.SMALL]: 40,
  [POTATO_FRY_SIZES.MEDIUM]: 55,
  [POTATO_FRY_SIZES.LARGE]: 65,
};

export function getPotatoFryTotalSales(sales: PotatoFrySales): number {
  return Object.entries(sales).reduce(
    (acc, [size, curr]) =>
      acc +
      (curr.quantity || 0) *
        POTATO_FRY_PRICES[size as keyof typeof POTATO_FRY_PRICES],
    0,
  );
}
