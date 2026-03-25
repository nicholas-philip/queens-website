import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export const cn = (...inputs) => twMerge(clsx(inputs))

export const formatCurrency = (amount, symbol = "GH₵") =>
  `${symbol}${Number(amount || 0).toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`

export const formatDate = (date) => {
  if (!date) return "—"
  return new Date(date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })
}

export const formatDateTime = (date) => {
  if (!date) return "—"
  return new Date(date).toLocaleString("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

export const formatRelativeTime = (date) => {
  if (!date) return "—"
  const diff  = Date.now() - new Date(date).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (days > 7)  return formatDate(date)
  if (days > 0)  return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (mins > 0)  return `${mins}m ago`
  return "Just now"
}

export const getStatusBadge = (status) => {
  const map = {
    Active: "badge badge-success", Paid: "badge badge-success",
    Delivered: "badge badge-success", Success: "badge badge-success", Approved: "badge badge-success",
    Draft: "badge badge-warning", Pending: "badge badge-warning", Unpaid: "badge badge-warning",
    Processing: "badge badge-info", Shipped: "badge badge-info",
    Refunded: "badge badge-purple",
    "Out of Stock": "badge badge-danger", Cancelled: "badge badge-danger",
    Failed: "badge badge-danger", Overdue: "badge badge-danger", Blocked: "badge badge-danger",
  }
  return map[status] || "badge badge-gray"
}

export const growthColor  = (v) => v > 0 ? "text-green-600" : v < 0 ? "text-red-500" : "text-slate-400"
export const growthArrow  = (v) => v > 0 ? "↑" : v < 0 ? "↓" : "→"
export const truncate     = (str, n = 40) => !str ? "" : str.length > n ? str.slice(0, n) + "..." : str
export const getInitials  = (name) => !name ? "?" : name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)

export const downloadCSV = (blob, filename) => {
  const url  = window.URL.createObjectURL(new Blob([blob]))
  const link = document.createElement("a")
  link.href  = url
  link.setAttribute("download", filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}