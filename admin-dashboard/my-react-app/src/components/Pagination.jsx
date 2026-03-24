import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null
  const { page, totalPages, total, limit } = pagination
  const from = (page - 1) * limit + 1
  const to   = Math.min(page * limit, total)

  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    if (totalPages <= 5)             return i + 1
    if (page <= 3)                   return i + 1
    if (page >= totalPages - 2)      return totalPages - 4 + i
    return page - 2 + i
  })

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
      <p className="text-sm text-slate-500">Showing <b>{from}–{to}</b> of <b>{total}</b></p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(page - 1)} disabled={page <= 1}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((n) => (
          <button key={n} onClick={() => onPageChange(n)}
            className={cn("flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors",
              n === page ? "bg-blue-600 text-white font-medium" : "border border-slate-200 text-slate-600 hover:bg-slate-50"
            )}>
            {n}
          </button>
        ))}
        <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}