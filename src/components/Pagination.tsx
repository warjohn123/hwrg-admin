interface Props {
  setPage: (page: number) => void;
  page: number;
  totalPages: number;
}

export default function Pagination({ setPage, page, totalPages }: Props) {
  if (totalPages === 1) return <></>;
  return (
    <div className="flex justify-center mt-6 space-x-2">
      <button
        onClick={() => setPage(Math.max(1, page - 1))}
        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
        disabled={page === 1}
      >
        Prev
      </button>
      <span className="px-4 py-2 text-sm font-medium">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => setPage(Math.min(totalPages, page + 1))}
        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
        disabled={page === totalPages}
      >
        Next
      </button>
    </div>
  );
}
