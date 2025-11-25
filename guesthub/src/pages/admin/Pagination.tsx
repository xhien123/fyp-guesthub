import React from "react";

type Props = {
  page: number;           
  pageSize: number;
  total: number;
  onPage: (next: number) => void;
  onPageSize: (size: number) => void;
  sizes?: number[];
  className?: string;
};

const Pagination: React.FC<Props> = ({
  page,
  pageSize,
  total,
  onPage,
  onPageSize,
  sizes = [10, 20, 50],
  className,
}) => {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < pageCount;

  return (
    <div className={`flex items-center justify-between gap-3 ${className ?? ""}`}>
      <div className="text-sm text-neutral-600">
        Page <span className="font-medium">{page}</span> of{" "}
        <span className="font-medium">{pageCount}</span>
        {" • "}
        <span className="text-neutral-500">Total: {total}</span>
      </div>
      <div className="flex items-center gap-2">
        <select
          className="border rounded-lg px-2 py-1 text-sm"
          value={pageSize}
          onChange={(e) => onPageSize(Number(e.target.value))}
        >
          {sizes.map((s) => (
            <option key={s} value={s}>
              {s}/page
            </option>
          ))}
        </select>
        <button
          className="border rounded-lg px-3 py-1 text-sm disabled:opacity-50"
          onClick={() => onPage(page - 1)}
          disabled={!canPrev}
        >
          Prev
        </button>
        <button
          className="border rounded-lg px-3 py-1 text-sm disabled:opacity-50"
          onClick={() => onPage(page + 1)}
          disabled={!canNext}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
