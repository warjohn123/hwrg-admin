interface Props {
  setPage: (page: number) => void;
  page: number;
  totalPages: number;
  limit?: number;
  setLimit?: (val: number) => void;
}

export default function Pagination({ setPage, page, totalPages, limit , setLimit }: Props) {
  if (totalPages <= 1) return <></>;
  return (
    <div className="flex justify-center mt-6 space-x-2">
      <div>
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
      {setLimit && (
        <div>
          <span className="px-4 py-2 text-sm font-medium">
            Items per page:
          </span>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
            <option value={200}>500</option>
          </select>
        </div>
      )}
    </div>
  );
}
