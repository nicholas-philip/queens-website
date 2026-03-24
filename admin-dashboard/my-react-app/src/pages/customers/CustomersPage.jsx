import { useEffect, useState, useCallback } from "react"
import { Link, useSearchParams }             from "react-router-dom"
import { Search, Download, Filter, User, Mail, Phone, Calendar, Star, ShieldAlert } from "lucide-react"
import { customersAPI, exportAPI }            from "../../libs/api"
import { formatCurrency, getStatusBadge, downloadCSV, formatDate, cn, getInitials } from "../../libs/utils"
import { useToast }                           from "../../context/ToastContext"
import { Table, TableHead, TableBody, TableRow, TableCell, TableLoading, TableEmpty } from "../../components/Table"
import Pagination                             from "../../components/Pagination"
import StatCard                               from "../../components/dashboard/StatCard"
import Spinner                                from "../../components/Spinner"

export default function CustomersPage() {
  const toast = useToast()
  const [searchParams] = useSearchParams()

  const [customers,  setCustomers]  = useState([])
  const [stats,      setStats]      = useState(null)
  const [pagination, setPagination] = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState(searchParams.get("search") || "")
  const [page,       setPage]       = useState(1)
  const [exporting,  setExporting]  = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 15, search }
      const [cRes, sRes] = await Promise.all([
        customersAPI.getAll(params),
        customersAPI.getStats()
      ])
      setCustomers(cRes.data.data)
      setPagination(cRes.data.pagination)
      setStats(sRes.data.stats)
    } catch { toast.error("Error", "Failed to load customers") }
    finally { setLoading(false) }
  }, [page, search, toast])

  useEffect(() => { load() }, [load])

  const handleExport = async () => {
    setExporting(true)
    try {
      const { data } = await exportAPI.customers()
      downloadCSV(data, "queens-customers-directory.csv")
    } catch { toast.error("Error", "Export failed.") }
    finally { setExporting(false) }
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Customer Database</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage relationships and track customer lifetime value.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport} 
            disabled={exporting} 
            className="flex items-center gap-2 px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-bold text-white hover:bg-neutral-800 transition-all disabled:opacity-50"
          >
            {exporting ? <Spinner size="sm" /> : <Download className="h-4 w-4" />}
            Export Directory
          </button>
        </div>
      </div>

       {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Customers" value={stats?.total || 0} icon={User} color="yellow" growth={stats?.growthPercent} />
        <StatCard title="New This Month"  value={stats?.newThisMonth || 0} icon={Calendar} color="green" />
        <StatCard title="Avg. Order Value" value={stats?.avgSpend || 0} icon={Star} color="blue" isCurrency />
        <StatCard title="Blocked Users"   value={stats?.blockedCount || 0} icon={ShieldAlert} color="red" />
      </div>

      {/* ── Search Bar ── */}
      <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-4 shadow-sm">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600" />
          <input 
            value={search} 
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, email, or phone number..."
            className="w-full bg-black/40 border border-neutral-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50 transition-all placeholder:text-neutral-700 font-medium" 
          />
        </div>
      </div>

      {/* ── Customers Table ── */}
      <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl overflow-hidden shadow-sm">
        <Table>
          <TableHead headers={["Customer profile", "Contact Info", "Registration", "Orders", "Spend", "Status"]} />
          <TableBody>
            {loading ? (
              <TableLoading cols={6} rows={10} />
            ) : customers.length === 0 ? (
              <TableEmpty message="No customers found matching your criteria." />
            ) : (
              customers.map((c) => (
                <TableRow key={c._id}>
                  {/* Name & Avatar */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "h-10 w-10 rounded-xl border flex items-center justify-center font-bold shadow-inner",
                            c.isBlocked ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-neutral-800 border-neutral-700 text-yellow-500"
                        )}>
                            {getInitials(c.name)}
                        </div>
                        <div className="flex flex-col">
                            <Link to={`/customers/${c._id}`} className="font-bold text-white hover:text-yellow-500 transition-colors">
                                {c.name}
                            </Link>
                            <span className="text-[10px] text-neutral-600 font-bold uppercase tracking-wider">{c.role || 'Customer'}</span>
                        </div>
                    </div>
                  </TableCell>

                  {/* Contact Info */}
                  <TableCell>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs text-neutral-400">
                           <Mail className="h-3 w-3 text-neutral-600" /> {c.email || '—'}
                        </div>
                        {c.phone && (
                            <div className="flex items-center gap-2 text-[10px] text-neutral-600">
                                <Phone className="h-2.5 w-2.5" /> {c.phone}
                            </div>
                        )}
                    </div>
                  </TableCell>

                  {/* Joined Date */}
                  <TableCell>
                    <span className="text-xs font-medium text-neutral-500">{formatDate(c.createdAt)}</span>
                  </TableCell>

                  {/* Order Count */}
                  <TableCell>
                    <span className="font-bold text-neutral-300">{c.totalOrders || 0}</span>
                  </TableCell>

                  {/* Lifetime Value */}
                  <TableCell>
                    <span className="font-bold text-yellow-500">{formatCurrency(c.totalSpent || 0)}</span>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <span className={cn(
                        "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border",
                        c.isBlocked ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-green-500/10 border-green-500/20 text-green-500"
                    )}>
                        {c.isBlocked ? "Blocked" : "Active"}
                    </span>
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