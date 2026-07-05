import { Prisma } from '@prisma/client';

/**
 * Deep-converts Prisma return types that don't round-trip through
 * `JSON.stringify` (as used by `NextResponse.json`) the way the Supabase JS
 * client's responses did:
 *
 * - `BigInt` (e.g. `remit_reports.id`) → `number`. `JSON.stringify` throws on
 *   BigInt; the Supabase client returned these as numbers.
 * - `Prisma.Decimal` (money/numeric columns) → `number`, matching the numeric
 *   values PostgREST/Supabase returned. (Prisma otherwise serialises Decimal to
 *   a string via its own `toJSON`.)
 *
 * `Date` values are left untouched — `JSON.stringify` renders them as ISO
 * strings, same as before.
 */
export function serialize<T>(value: T): T {
  return walk(value) as T;
}

function walk(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === 'bigint') return Number(value);
  if (Prisma.Decimal.isDecimal(value)) {
    return (value as Prisma.Decimal).toNumber();
  }
  if (value instanceof Date) return value;
  if (Array.isArray(value)) return value.map(walk);
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      out[key] = walk(val);
    }
    return out;
  }
  return value;
}
