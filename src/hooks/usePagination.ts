import { useState } from "react";

const pageSize = 5;

export function usePagination() {
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / pageSize);

  return { page, pageSize, totalPages, setPage, setTotal };
}
