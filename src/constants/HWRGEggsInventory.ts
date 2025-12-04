import { IHWRGEggsSales } from '@/types/HWRGEggsReport';

export interface IHWRGEggsProductItem {
  name: string;
  attribute: keyof IHWRGEggsSales;
  pcPrice: number;
  dozenPrice: number;
  trayPrice: number;
}

export const HWRG_EGGS_PRODUCTS: { [key: string]: IHWRGEggsProductItem } = {
  PL: {
    name: 'PL',
    attribute: 'pl',
    pcPrice: 8,
    dozenPrice: 95,
    trayPrice: 240,
  },
  PW: {
    name: 'PW',
    attribute: 'pw',
    pcPrice: 8.5,
    dozenPrice: 100,
    trayPrice: 250,
  },
  SMALL: {
    name: 'Small',
    attribute: 'small',
    pcPrice: 8.75,
    dozenPrice: 104,
    trayPrice: 260,
  },
  MEDIUM: {
    name: 'Medium',
    attribute: 'medium',
    pcPrice: 9.25,
    dozenPrice: 110,
    trayPrice: 275,
  },
  LARGE: {
    name: 'Large',
    attribute: 'large',
    pcPrice: 9.75,
    dozenPrice: 117,
    trayPrice: 290,
  },
  XL: {
    name: 'XL',
    attribute: 'xl',
    pcPrice: 10.25,
    dozenPrice: 121,
    trayPrice: 300,
  },
};
