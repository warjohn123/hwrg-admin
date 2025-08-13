import { PotatoFrySales } from '@/types/PotatoFryReport';

export interface IPotatoFryProductItem {
  name: string;
  attribute: keyof PotatoFrySales;
  price: number;
}

export const POTATO_FRY_PRODUCTS: { [key: string]: IPotatoFryProductItem } = {
  SMALL: {
    name: 'Small',
    attribute: 'small',
    price: 40,
  },
  MEDIUM: {
    name: 'Medium',
    attribute: 'medium',
    price: 55,
  },
  LARGE: {
    name: 'Large',
    attribute: 'large',
    price: 65,
  },
} as const;
