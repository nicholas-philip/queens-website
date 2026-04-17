import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "../libs/utils"

export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null
  const { page, totalPages, total, limit } = pagination
  const from = (page - 1) * limit + 1
  const to   = Math.min(page * limit, total)

  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    if (totalPages <= 5)        return i + 1
    if (page <= 3)              return i + 1
    if (page >= totalPages - 2) return totalPages - 4 + i
    return page - 2 + i
  })

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-800">
      <p className="text-sm text-neutral-500">
        Showing <span className="text-neutral-300 font-medium">{from}–{to}</span> of{" "}
        <span className="text-neutral-300 font-medium">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((n) => (
          <button
            key={n}
            onClick={() => onPageChange(n)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors",
              n === page
                ? "bg-yellow-600 text-black font-semibold"
                : "border border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
            )}
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
