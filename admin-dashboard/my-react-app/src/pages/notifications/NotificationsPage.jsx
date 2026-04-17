import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  Bell, Trash2, CheckCheck, X, Loader2,
  ShoppingCart, Package, AlertTriangle, Star,
  DollarSign, FileText, XCircle, Settings
} from "lucide-react"
import { notificationsAPI } from "../../libs/api"
import { useToast } from "../../context/ToastContext"

const formatRelativeTime = (dateString) => {
  if (!dateString) return "Just now"
  const date = new Date(dateString)
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) + " · " + date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

const TYPE_MAP = {
  NEW_ORDER:        { icon: ShoppingCart,   color: "text-yellow-500" },
  OUT_OF_STOCK:     { icon: Package,        color: "text-white" },
  LOW_STOCK:        { icon: AlertTriangle,  color: "text-neutral-400" },
  NEW_REVIEW:       { icon: Star,           color: "text-white" },
  REFUND_PROCESSED: { icon: DollarSign,     color: "text-neutral-300" },
  OVERDUE_INVOICE:  { icon: FileText,       color: "text-white" },
  PAYMENT_FAILED:   { icon: XCircle,        color: "text-neutral-400" },
  PAYMENT_RECEIVED: { icon: DollarSign,     color: "text-green-500" },
  CRM_ALERT:        { icon: Bell,           color: "text-yellow-500" },
  SYSTEM:           { icon: Settings,       color: "text-neutral-500" },
}

export default function NotificationsPage() {
  const toast = useToast()
  const navigate = useNavigate()

  const [notifs, setNotifs] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [clearing, setClearing] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 20 }
      if (filter === "unread") params.isRead = false
      if (filter === "read")   params.isRead = true
      const { data } = await notificationsAPI.getAll(params)
      setNotifs(data.data || [])
      setPagination(data.pagination)
    } catch { toast.error("Error", "Failed to load notifications.") }
    finally { setLoading(false) }
  }, [page, filter, toast])

  useEffect(() => { load() }, [load])

  const markOne = async (id) => {
    try {
      await notificationsAPI.markOneRead(id)
      setNotifs((p) => p.map((n) => n._id === id ? { ...n, isRead: true } : n))
    } catch { toast.error("Error", "Failed to mark as read.") }
  }

  const deleteOne = async (id) => {
    try {
      await notificationsAPI.delete(id)
      setNotifs((p) => p.filter((n) => n._id !== id))
    } catch { toast.error("Error", "Delete failed.") }
  }

  const handleClick = (n) => {
    if (!n.isRead) markOne(n._id)
    if (n.path) navigate(n.path)
  }

  const markAllRead = async () => {
    setBulkLoading(true)
    try {
      await notificationsAPI.markAllRead()
      setNotifs((p) => p.map((n) => ({ ...n, isRead: true })))
      toast.success("Done", "All notifications marked as read.")
    } catch { toast.error("Error", "Failed to mark all as read.") }
    finally { setBulkLoading(false) }
  }

  const clearRead = async () => {
    setClearing(true)
    try {
      await notificationsAPI.clearRead()
      toast.success("Cleared", "Read notifications removed.")
      load()
    } catch { toast.error("Error", "Failed to clear notifications.") }
    finally { setClearing(false) }
  }

  const unreadCount = notifs.filter((n) => !n.isRead).length

  return (
    <div className="space-y-6 animate-fade-in pb-20 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            Notifications
            {unreadCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 text-xs font-black text-black">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={markAllRead} disabled={bulkLoading || unreadCount === 0}
            className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-bold text-white hover:bg-neutral-800 transition-all flex items-center gap-2 disabled:opacity-40">
            {bulkLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCheck className="h-3.5 w-3.5 text-neutral-400" />}
            Mark all read
          </button>
          <button onClick={clearRead} disabled={clearing}
            className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-bold text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all flex items-center gap-2 disabled:opacity-40">
            {clearing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            Clear read
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-xl w-fit">
        {[
          { key: "all",    label: "All" },
          { key: "unread", label: "Unread" },
          { key: "read",   label: "Read" },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => { setFilter(key); setPage(1) }}
            className={`px-5 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === key ? "bg-white text-black" : "text-neutral-500 hover:text-neutral-300"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
        </div>
      ) : notifs.length === 0 ? (
        <div className="border border-neutral-800 rounded-2xl p-16 text-center flex flex-col items-center">
          <div className="h-12 w-12 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-center mb-4">
            <Bell className="h-6 w-6 text-neutral-600" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">No notifications</h3>
          <p className="text-sm text-neutral-500 max-w-xs">Incoming alerts and updates will appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-neutral-800/60 border border-neutral-800 rounded-2xl overflow-hidden">
          {notifs.map((n) => {
            const { icon: Icon, color } = TYPE_MAP[n.type] || TYPE_MAP.SYSTEM
            return (
              <div
                key={n._id}
                onClick={() => handleClick(n)}
                className={`relative flex items-start gap-4 px-5 py-4 transition-colors cursor-pointer group
                  ${!n.isRead ? "bg-neutral-900/60 hover:bg-neutral-900" : "bg-transparent hover:bg-neutral-900/30 opacity-60 hover:opacity-100"}`}
              >
                {/* Unread bar */}
                {!n.isRead && (
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-yellow-500" />
                )}

                {/* Icon */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-800 border border-neutral-700 mt-0.5">
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className={`text-sm truncate ${!n.isRead ? "font-bold text-white" : "font-medium text-neutral-400"}`}>
                      {n.title}
                    </p>
                    {!n.isRead && (
                      <span className="shrink-0 h-1.5 w-1.5 rounded-full bg-yellow-500" />
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 leading-relaxed">{n.message}</p>
                  <p className="text-xs font-mono text-neutral-700 mt-1.5 uppercase tracking-widest">
                    {formatRelativeTime(n.createdAt)}
                  </p>
                </div>

                {/* Delete */}
                <button
                  onClick={(e) => { e.stopPropagation(); deleteOne(n._id) }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-neutral-600 hover:text-white rounded-lg transition-all mt-0.5"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-4">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all border ${
                page === p ? "bg-yellow-500 text-black border-yellow-500" : "bg-transparent text-neutral-500 border-neutral-800 hover:border-neutral-600 hover:text-white"
              }`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
