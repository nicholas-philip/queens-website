import { cn } from "../lib/utils"

export function Table({ children, className }) {
  return <div className={cn("overflow-x-auto", className)}><table className="w-full text-sm">{children}</table></div>
}

export function TableHead({ headers = [] }) {
  return (
    <thead><tr className="table-header">
      {headers.map((h, i) => <th key={i} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>)}
    </tr></thead>
  )
}

export function TableBody({ children }) { return <tbody>{children}</tbody> }

export function TableRow({ children, onClick, className }) {
  return <tr className={cn("table-row", onClick && "cursor-pointer", className)} onClick={onClick}>{children}</tr>
}

export function TableCell({ children, className }) {
  return <td className={cn("table-cell", className)}>{children}</td>
}

export function TableEmpty({ message = "No records found." }) {
  return <tr><td colSpan={100} className="px-4 py-16 text-center text-slate-400 text-sm">{message}</td></tr>
}

export function TableLoading({ cols = 5, rows = 6 }) {
  return Array.from({ length: rows }).map((_, i) => (
    <tr key={i} className="border-b border-slate-100">
      {Array.from({ length: cols }).map((_, j) => (
        <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" /></td>
      ))}
    </tr>
  ))
}