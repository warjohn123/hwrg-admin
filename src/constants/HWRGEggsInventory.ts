import { IHWRGEggsSales } from '@/types/HWRGEggsReport';

export interface IHWRGEggsProductItem {
  name: string;
  attribute: keyof IHWRGEggsSales;
  pcPrice: number;
  dozenPrice: number;
  trayPrice: number;
}

export const HWRG_EGGS_PRODUCTS: { [key: string]: IHWRGEggsProductItem } = {
  PW: {
    name: 'PW',
    attribute: 'pw',
    pcPrice: 8,
    dozenPrice: 95,
    trayPrice: 236,
  },
  PL: {
    name: 'PL',
    attribute: 'pl',
    pcPrice: 8.25,
    dozenPrice: 99,
    trayPrice: 247,
  },
  SMALL: {
    name: 'Small',
    attribute: 'small',
    pcPrice: 8.5,
    dozenPrice: 103,
    trayPrice: 258,
  },
  MEDIUM: {
    name: 'Medium',
    attribute: 'medium',
    pcPrice: 9,
    dozenPrice: 107,
    trayPrice: 269,
  },
  LARGE: {
    name: 'Large',
    attribute: 'large',
    pcPrice: 9.75,
    dozenPrice: 116,
    trayPrice: 290,
  },
  XL: {
    name: 'XL',
    attribute: 'xl',
    pcPrice: 10,
    dozenPrice: 118,
    trayPrice: 295,
  },
  JUMBO: {
    name: 'Jumbo',
    attribute: 'jumbo',
    pcPrice: 11,
    dozenPrice: 130,
    trayPrice: 320,
  },
};
