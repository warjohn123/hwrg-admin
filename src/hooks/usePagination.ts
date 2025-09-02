import { useState } from "react";


export function usePagination() {
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);

  const totalPages = Math.ceil(total / limit);

  return { page, limit, totalPages, setPage, setTotal, setLimit };
}
