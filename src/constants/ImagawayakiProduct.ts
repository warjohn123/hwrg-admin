import { ImagawayakiSales } from '@/types/ImagawayakiReport';

export interface IImagawayakiProductItem {
  name: string;
  attribute: keyof ImagawayakiSales;
  price: number;
}

export const IMAGAWAYAKI_PRODUCTS: { [key: string]: IImagawayakiProductItem } =
  {
    CHOCOLATE: {
      name: 'Chocolate',
      attribute: 'chocolate',
      price: 10,
    },
    OREO: {
      name: 'Oreo',
      attribute: 'oreo',
      price: 10,
    },
    CHEESE: {
      name: 'Cheese',
      attribute: 'cheese',
      price: 10,
    },
    CUSTARD: {
      name: 'Custard',
      attribute: 'custard',
      price: 10,
    },
    PLAIN: {
      name: 'Plain',
      attribute: 'plain',
      price: 10,
    },
    JUICE: {
      name: 'Juice',
      attribute: 'juice',
      price: 25,
    },
    MINUTE_MAID: {
      name: 'Minute Maid',
      attribute: 'minute_maid',
      price: 20,
    },
    MINERAL_WATER: {
      name: 'Mineral Water',
      attribute: 'mineral_water',
      price: 20,
    },
  };
