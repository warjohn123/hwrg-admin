import { ChickyOinkSales } from '@/types/ChickyOinkReport';

export interface IInventoryItem {
  name: string;
  attribute: keyof ChickyOinkSales;
  price: number;
}

export const CHICKY_OINK_INVENTORY: { [key: string]: IInventoryItem } = {
  REGULAR_CHICKEN: {
    name: 'Regular Chicken',
    attribute: 'regular_chicken',
    price: 310,
  },
  SPICY_CHICKEN: {
    name: 'Spicy Chicken',
    attribute: 'spicy_chicken',
    price: 320,
  },
  REGULAR_LIEMPO: {
    name: 'Regular Liempo',
    attribute: 'regular_liempo',
    price: 260,
  },
  SPICY_LIEMPO: {
    name: 'Spicy Liempo',
    attribute: 'spicy_liempo',
    price: 270,
  },
  LIOG: { name: 'Liog', attribute: 'liog', price: 12 },
  SPICY_LIOG: {
    name: 'Spicy Liog',
    attribute: 'spicy_liog',
    price: 12,
  },
  POSO: { name: 'Poso', attribute: 'poso', price: 8 },
  ATCHARA_SMALL: {
    name: 'Atchara Small',
    attribute: 'atchara_small',
    price: 30,
  },
  ATCHARA_BIG: {
    name: 'Atchara Big',
    attribute: 'atchara_big',
    price: 70,
  },
  COKE: {
    name: "Coke",
    attribute: "coke",
    price: 20,
  },
  SPRITE: {
    name: "Sprite",
    attribute: "sprite",
    price: 20,
  },
  ROYAL: {
    name: "Royal",
    attribute: "royal",
    price: 20,
  },
  MINERAL_WATER: {
    name: "Mineral Water",
    attribute: "mineral_water",
    price: 20,
  },
  ULING: { name: 'Uling', attribute: 'uling', price: 0 },
};
