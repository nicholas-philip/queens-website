import { useEffect, useState, useCallback } from "react"
import { useSearchParams, Link }               from "react-router-dom"
import { Search, Download, Filter, CreditCard, ArrowUpRight, CheckCircle2, XCircle, Clock } from "lucide-react"
import { transactionsAPI, exportAPI }           from "../../libs/api"
import { formatCurrency, formatDate, downloadCSV, cn } from "../../libs/utils"
import { useToast }                           from "../../context/ToastContext"
import { Table, TableHead, TableBody, TableRow, TableCell, TableLoading, TableEmpty } from "../../components/Table"
import Pagination                             from "../../components/Pagination"
import StatCard                               from "../../components/dashboard/StatCard"
import Spinner                                from "../../components/Spinner"

export default function TransactionsPage() {
  const toast = useToast()
  const [searchParams] = useSearchParams()

  const [transactions, setTransactions] = useState([])
  const [stats,        setStats]        = useState(null)
  const [pagination,   setPagination]   = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState(searchParams.get("search") || "")
  const [status,       setStatus]       = useState(searchParams.get("status") || "")
  const [page,         setPage]         = useState(1)
  const [exporting,    setExporting]    = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 15, search, status }
      const [{ data: tData }, { data: sData }] = await Promise.all([
        transactionsAPI.getAll(params),
        transactionsAPI.getSummary()
      ])
      setTransactions(tData.data)
      setPagination(tData.pagination)
      setStats(sData.summary)
    } catch { toast.error("Error", "Failed to load transactions") }
    finally { setLoading(false) }
  }, [page, search, status, toast])

  useEffect(() => { load() }, [load])

  const handleExport = async () => {
    setExporting(true)
    try {
      const { data } = await exportAPI.transactions({ status })
      downloadCSV(data, `transactions-${new Date().toISOString().split('T')[0]}.csv`)
    } catch { toast.error("Error", "Export failed.") }
    finally { setExporting(false) }
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Financial Ledger</h1>
          <p className="text-sm text-neutral-500 mt-1">Audit and track all incoming payments and refunds.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport} 
            disabled={exporting} 
            className="flex items-center gap-2 px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-bold text-white hover:bg-neutral-800 transition-all disabled:opacity-50"
          >
            {exporting ? <Spinner size="sm" /> : <Download className="h-4 w-4" />}
            Export CSV
          </button>
        </div>
      </div>

       {/* ── Summary Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Volume" value={stats?.totalVolume || 0} icon={CreditCard} color="yellow" isCurrency />
        <StatCard title="Successful"   value={stats?.successCount || 0} icon={CheckCircle2} color="green" />
        <StatCard title="Failed/Pending" value={(stats?.failedCount || 0) + (stats?.pendingCount || 0)} icon={Clock} color="red" />
      </div>

      {/* ── Filters Bar ── */}
      <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600" />
          <input 
            value={search} 
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by transaction reference or order ID..."
            className="w-full bg-black/40 border border-neutral-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50 transition-all font-medium" 
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
            <select 
                value={status} 
                onChange={(e) => { setStatus(e.target.value); setPage(1) }}
                className="bg-black/40 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50 cursor-pointer w-full md:w-40 appearance-none"
            >
                <option value="">All Statuses</option>
                <option value="Success">Success</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
            </select>
        </div>
      </div>

      {/* ── Transactions Table ── */}
      <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl overflow-hidden shadow-sm">
        <Table>
          <TableHead headers={["Reference", "Order", "Method", "Total", "Date", "Status"]} />
          <TableBody>
            {loading ? (
              <TableLoading cols={6} rows={12} />
            ) : transactions.length === 0 ? (
              <TableEmpty message="No transactions recorded yet." />
            ) : (
              transactions.map((t) => (
                <TableRow key={t._id}>
                  {/* Reference */}
                  <TableCell>
                    <span className="font-mono text-[11px] font-bold text-neutral-400 bg-neutral-900 border border-neutral-800 px-2 py-1 rounded-lg">
                      {t.paymentReference || t._id.slice(-8).toUpperCase()}
                    </span>
                  </TableCell>

                  {/* Order */}
                  <TableCell>
                    <Link to={`/orders/${t.orderId}`} className="font-bold text-yellow-500 hover:text-yellow-400 flex items-center gap-1 group">
                        #{t.orderNumber}
                        <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </TableCell>

                  {/* Method */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                           <CreditCard className="h-3 w-3 text-neutral-500" />
                        </div>
                        <span className="text-xs font-bold text-neutral-300 uppercase tracking-tighter">{t.paymentMethod || 'Paystack'}</span>
                    </div>
                  </TableCell>

                  {/* Amount */}
                  <TableCell>
                    <span className="font-bold text-white">{formatCurrency(t.amount)}</span>
                  </TableCell>

                  {/* Date */}
                  <TableCell>
                    <span className="text-xs font-medium text-neutral-500">{formatDate(t.createdAt)}</span>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                         {t.status === 'Success' && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                         {t.status === 'Failed' && <XCircle className="h-3.5 w-3.5 text-red-500" />}
                         {t.status === 'Pending' && <Clock className="h-3.5 w-3.5 text-yellow-500 animate-pulse" />}
                         <span className={cn(
                            "text-[10px] font-bold uppercase tracking-widest",
                            t.status === 'Success' ? "text-green-500" : 
                            t.status === 'Failed' ? "text-red-500" : "text-yellow-500"
                         )}>
                            {t.status}
                         </span>
                    </div>
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