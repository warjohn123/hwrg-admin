import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export function useQueryParams() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setQueryParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }

      router.replace(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  return { searchParams, setQueryParam };
}
