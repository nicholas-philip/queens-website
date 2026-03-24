import { cn } from "../libs/utils"

export function Table({ children, className }) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full text-sm">{children}</table>
    </div>
  )
}

export function TableHead({ headers = [] }) {
  return (
    <thead>
      <tr className="border-b border-neutral-800 bg-neutral-900/50">
        {headers.map((h, i) => (
          <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider whitespace-nowrap">
            {h}
          </th>
        ))}
      </tr>
    </thead>
  )
}

export function TableBody({ children }) {
  return <tbody className="divide-y divide-neutral-800">{children}</tbody>
}

export function TableRow({ children, onClick, className }) {
  return (
    <tr
      className={cn(
        "transition-colors hover:bg-neutral-800/40",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

export function TableCell({ children, className }) {
  return (
    <td className={cn("px-4 py-3 text-sm text-neutral-300", className)}>
      {children}
    </td>
  )
}

export function TableEmpty({ message = "No records found." }) {
  return (
    <tr>
      <td colSpan={100} className="px-4 py-16 text-center text-neutral-500 text-sm">
        {message}
      </td>
    </tr>
  )
}

export function TableLoading({ cols = 5, rows = 6 }) {
  return Array.from({ length: rows }).map((_, i) => (
    <tr key={i} className="border-b border-neutral-800">
      {Array.from({ length: cols }).map((_, j) => (
        <td key={j} className="px-4 py-3">
          <div className="h-4 bg-neutral-800 rounded animate-pulse w-3/4" />
        </td>
      ))}
    </tr>
  ))
}