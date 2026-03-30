import { useEffect, useState, useCallback } from "react"
import { Link, useSearchParams }             from "react-router-dom"
import { Search, Download, Filter, Eye, ShoppingBag, CreditCard, Loader2 } from "lucide-react"
import { ordersAPI, exportAPI }               from "../../libs/api"
import { formatCurrency, getStatusBadge, downloadCSV, formatDate, cn } from "../../libs/utils"
import { useToast }                           from "../../context/ToastContext"
import { Table, TableHead, TableBody, TableRow, TableCell, TableLoading, TableEmpty } from "../../components/Table"
import Pagination                             from "../../components/Pagination"
import Spinner                                from "../../components/Spinner"

export default function OrdersPage() {
  const toast = useToast()
  const [searchParams] = useSearchParams()

  const [orders,     setOrders]     = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState(searchParams.get("search") || "")
  const [status,     setStatus]     = useState(searchParams.get("status") || "")
  const [page,       setPage]       = useState(1)
  const [payment,    setPayment]    = useState("")
  const [exporting,  setExporting]  = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 15, search, status, paymentStatus: payment }
      const { data } = await ordersAPI.getAll(params)
      setOrders(data.data)
      setPagination(data.pagination)
    } catch { toast.error("Error", "Failed to load orders") }
    finally { setLoading(false) }
  }, [page, search, status, payment, toast])

  useEffect(() => { load() }, [load])

  const handleExport = async () => {
    setExporting(true)
    try {
      const { data } = await exportAPI.orders({ status })
      downloadCSV(data, `orders-${status || 'all'}.csv`)
    } catch { toast.error("Error", "Export failed.") }
    finally { setExporting(false) }
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight text-shadow-sm">Customer Orders</h1>
          <p className="text-sm text-neutral-500 mt-1">Monitor and process incoming store transactions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport} 
            disabled={exporting} 
            className="flex items-center gap-2 px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-bold text-white hover:bg-neutral-800 transition-all disabled:opacity-50"
          >
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export CSV
          </button>
        </div>
      </div>

      {/* ── Filters Bar ── */}
      <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600" />
          <input 
            value={search} 
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by order number or customer name..."
            className="w-full bg-black/40 border border-neutral-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50 transition-all placeholder:text-neutral-700" 
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-48">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600" />
                <select 
                    value={status} 
                    onChange={(e) => { setStatus(e.target.value); setPage(1) }}
                    className="w-full bg-black/40 border border-neutral-800 rounded-xl pl-11 pr-8 py-2.5 text-sm text-white appearance-none focus:outline-none focus:ring-1 focus:ring-yellow-500/50 cursor-pointer"
                >
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>

            <div className="relative flex-1 md:w-48">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600" />
                <select 
                    value={payment} 
                    onChange={(e) => { setPayment(e.target.value); setPage(1) }}
                    className="w-full bg-black/40 border border-neutral-800 rounded-xl pl-11 pr-8 py-2.5 text-sm text-white appearance-none focus:outline-none focus:ring-1 focus:ring-yellow-500/50 cursor-pointer"
                >
                    <option value="">All Payments</option>
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Refunded">Refunded</option>
                </select>
            </div>
        </div>
      </div>

      {/* ── Orders Table ── */}
      <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl overflow-hidden shadow-sm">
        <Table>
          <TableHead headers={["Order Info", "Customer", "Date", "Total", "Payment", "Status", "Actions"]} />
          <TableBody>
            {loading ? (
              <TableLoading cols={7} rows={10} />
            ) : orders.length === 0 ? (
              <TableEmpty message="No orders found. Once customers start buying, they'll appear here!" />
            ) : (
              orders.map((o) => (
                <TableRow key={o._id}>
                  {/* Order ID */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                            <ShoppingBag className="h-4 w-4 text-yellow-500" />
                        </div>
                        <div className="flex flex-col">
                            <Link to={`/orders/${o._id}`} className="font-bold text-white hover:text-yellow-500 transition-colors">
                                {o.orderNumber || `#${o._id.slice(-6).toUpperCase()}`}
                            </Link>
                            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">{o.items?.length || 0} Items</span>
                        </div>
                    </div>
                  </TableCell>

                  {/* Customer */}
                  <TableCell>
                    <div className="flex flex-col">
                        <span className="font-bold text-neutral-300">{o.customerDetails?.name || "Guest Customer"}</span>
                        <span className="text-[10px] text-neutral-600">{o.customerDetails?.email}</span>
                    </div>
                  </TableCell>

                  {/* Date */}
                  <TableCell>
                    <span className="text-xs font-medium text-neutral-400">{formatDate(o.createdAt)}</span>
                  </TableCell>

                  {/* Total */}
                  <TableCell>
                    <span className="font-bold text-white">{formatCurrency(o.total)}</span>
                  </TableCell>

                  {/* Payment */}
                  <TableCell>
                    <span className={cn(
                        "px-2 py-1 rounded text-[10px] font-bold uppercase",
                        o.paymentStatus === 'Paid' ? "text-green-500 bg-green-500/10" : "text-neutral-500 bg-neutral-800"
                    )}>
                        {o.paymentStatus || 'Unpaid'}
                    </span>
                    <p className="text-[9px] text-neutral-600 mt-1 font-medium">{o.paymentMethod || '—'}</p>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <span className={cn(
                        "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border",
                        getStatusBadge(o.currentStatus).replace("badge ", "bg-opacity-10 ")
                    )}>
                        {o.currentStatus}
                    </span>
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <Link 
                      to={`/orders/${o._id}`}
                      className="inline-flex items-center gap-2 p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-500 hover:text-white hover:border-neutral-700 transition-all group"
                    >
                      <Eye className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>
    </div>
  )
}