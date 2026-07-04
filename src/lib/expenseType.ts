import { $Enums } from '@prisma/client';

/**
 * Maps the human-readable `expense_type` DB enum labels (which contain spaces,
 * e.g. "Chicky Oink") to the Prisma Client enum identifiers ("Chicky_Oink").
 * Incoming request payloads and query params use the labels.
 */
export const EXPENSE_TYPE_BY_LABEL: Record<string, $Enums.expense_type> = {
  'Chicky Oink': 'Chicky_Oink',
  Imagawayaki: 'Imagawayaki',
  'Potato Fry': 'Potato_Fry',
  'HWRG Eggs': 'HWRG_Eggs',
};

export function toExpenseType(
  label: unknown,
): $Enums.expense_type | undefined {
  if (typeof label !== 'string') return undefined;
  return EXPENSE_TYPE_BY_LABEL[label];
}
