import { useEffect, useState, useCallback } from "react"
import { useSearchParams, Link }               from "react-router-dom"
import { Search, Download, Filter, FileText, ArrowUpRight, CheckCircle2, AlertCircle, Clock, Printer, Loader2 } from "lucide-react"
import { invoicesAPI, exportAPI }               from "../../libs/api"
import { formatCurrency, formatDate, downloadCSV, cn, getStatusBadge } from "../../libs/utils"
import { useToast }                           from "../../context/ToastContext"
import { Table, TableHead, TableBody, TableRow, TableCell, TableLoading, TableEmpty } from "../../components/Table"
import Pagination                             from "../../components/Pagination"
import StatCard                               from "../../components/dashboard/StatCard"
import Spinner                                from "../../components/Spinner"

export default function InvoicesPage() {
  const toast = useToast()
  const [searchParams] = useSearchParams()

  const [invoices,   setInvoices]   = useState([])
  const [stats,      setStats]      = useState(null)
  const [pagination, setPagination] = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState(searchParams.get("search") || "")
  const [status,     setStatus]     = useState(searchParams.get("status") || "")
  const [page,       setPage]       = useState(1)
  const [exporting,  setExporting]  = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 15, search, status }
      const [{ data: iData }, { data: sData }] = await Promise.all([
        invoicesAPI.getAll(params),
        invoicesAPI.getSummary()
      ])
      setInvoices(iData.data)
      setPagination(iData.pagination)
      setStats(sData.summary)
    } catch { toast.error("Error", "Failed to load invoices") }
    finally { setLoading(false) }
  }, [page, search, status, toast])

  useEffect(() => { load() }, [load])

  const handleExport = async () => {
    setExporting(true)
    try {
      const { data } = await exportAPI.invoices({ status })
      downloadCSV(data, `invoices-export-${new Date().toISOString().split('T')[0]}.csv`)
    } catch { toast.error("Error", "Export failed.") }
    finally { setExporting(false) }
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10 font-sans">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-base-content tracking-tight">Billing & Invoices</h1>
          <p className="text-sm text-base-content/50 mt-1">Generate and track customer invoices and billing history.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport} 
            disabled={exporting} 
            className="flex items-center gap-2 px-4 py-2.5 bg-base-200 border border-base-300 rounded-xl text-xs font-bold text-base-content hover:bg-base-300 transition-all disabled:opacity-50"
          >
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export Directory
          </button>
        </div>
      </div>

       {/* ── Billing Summary ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Overall Revenue" value={stats?.paidTotal || 0} icon={FileText} color="yellow" isCurrency />
        <StatCard title="Paid Invoices"   value={stats?.paidCount || 0} icon={CheckCircle2} color="green" />
        <StatCard title="Unpaid Items"    value={stats?.unpaidCount || 0} icon={Clock} color="red" />
        <StatCard title="Overdue"        value={stats?.overdueCount || 0} icon={AlertCircle} color="red" />
      </div>

      {/* ── Filters Bar ── */}
      <div className="bg-base-100 border border-base-300 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/50" />
          <input 
            value={search} 
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search invoice number, customer name..."
            className="w-full bg-base-200 border border-base-300 rounded-xl pl-11 pr-4 py-2.5 text-sm text-base-content focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-medium placeholder:text-base-content/30" 
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
            <select 
                value={status} 
                onChange={(e) => { setStatus(e.target.value); setPage(1) }}
                className="bg-base-200 border border-base-300 rounded-xl px-4 py-2.5 text-sm text-base-content focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer w-full md:w-40 appearance-none"
            >
                <option value="">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Overdue">Overdue</option>
                <option value="Cancelled">Cancelled</option>
            </select>
        </div>
      </div>

      {/* ── Invoices Table ── */}
      <div className="bg-base-100 border border-base-300 rounded-3xl overflow-hidden shadow-sm">
        <Table>
          <TableHead headers={["Invoice #", "Recipient", "Order", "Total Amount", "Issue Date", "Status", "Actions"]} />
          <TableBody>
            {loading ? (
              <TableLoading cols={7} rows={12} />
            ) : invoices.length === 0 ? (
              <TableEmpty message="No invoices found." />
            ) : (
              invoices.map((i) => (
                <TableRow key={i._id}>
                  {/* Invoice ID */}
                  <TableCell>
                    <Link to={`/invoices/${i._id}`} className="font-bold text-primary hover:text-primary transition-all">
                        {i.invoiceNumber || `INV-${i._id.slice(-6).toUpperCase()}`}
                    </Link>
                  </TableCell>

                  {/* Customer Info */}
                  <TableCell>
                    <div className="flex flex-col">
                        <span className="font-bold text-base-content/80">{i.customerName || "Guest Customer"}</span>
                        <span className="text-xs text-base-content/40 font-bold uppercase tracking-tight">{i.customerPhone}</span>
                    </div>
                  </TableCell>

                  {/* Order Link */}
                  <TableCell>
                    <Link to={`/orders/${i.orderRef?._id || i.orderRef}`} className="font-bold text-base-content/60 hover:text-base-content transition-all flex items-center gap-1 group">
                        #{i.orderRef?.orderNumber || "—"}
                        <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </TableCell>

                  {/* Amount */}
                  <TableCell>
                    <span className="font-bold text-base-content">{formatCurrency(i.amount)}</span>
                  </TableCell>

                  {/* Date */}
                  <TableCell>
                    <span className="text-xs font-medium text-base-content/50">{formatDate(i.createdAt)}</span>
                  </TableCell>

                  {/* Status Badge */}
                  <TableCell>
                    <span className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest border transition-all hover:scale-105 active:scale-95 cursor-default",
                        i.status === 'Paid' ? "bg-green-500/10 border-green-500/20 text-green-500" : 
                        i.status === 'Overdue' ? "bg-red-500/10 border-red-500/20 text-red-500" :
                        "bg-yellow-500/10 border-yellow-500/20 text-yellow-500"
                    )}>
                        {i.status}
                    </span>
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <Link 
                            to={`/invoices/${i._id}`}
                            className="p-2.5 bg-base-200 border border-base-300 rounded-xl text-base-content/50 hover:text-primary transition-all group shadow-inner"
                        >
                            <Printer className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        </Link>
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
