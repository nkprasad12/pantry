import { PantryItem } from '../db';

export function isLow(item: PantryItem) {
  return item.quantity <= (item.needed ?? 1000) * 0.4;
}
