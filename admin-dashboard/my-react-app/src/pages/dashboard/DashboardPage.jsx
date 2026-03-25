import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { DollarSign, ShoppingCart, Users, Package, AlertCircle, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { dashboardAPI, analyticsAPI } from "../../libs/api"
import { formatCurrency } from "../../libs/utils"
import Spinner from "../../components/Spinner"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts"

const PIE_COLORS = ["#d4a017", "#ffffff", "#737373", "#404040", "#1a1a1a"]

const formatRelativeTime = (dateString) => {
  if (!dateString) return "Just now"
  const date = new Date(dateString)
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) + " · " + date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

const getStatusStyle = (status) => {
  const base = "px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-widest whitespace-nowrap border"
  switch (status) {
    case "Pending":    return `${base} bg-neutral-900 text-yellow-500 border-yellow-600/20`
    case "Processing": return `${base} bg-neutral-900 text-neutral-300 border-neutral-700`
    case "Shipped":    return `${base} bg-neutral-900 text-white border-neutral-600`
    case "Delivered":  return `${base} bg-neutral-900 text-white border-white/20`
    case "Cancelled":  return `${base} bg-neutral-900 text-neutral-500 border-neutral-700`
    default:           return `${base} bg-neutral-900 text-neutral-400 border-neutral-800`
  }
}

function StatCard({ title, value, isCurrency, icon: Icon, growth }) {
  const isPositive = growth > 0
  const isNegative = growth < 0

  return (
    <div className="border border-neutral-800 rounded-2xl p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3">{title}</p>
          <h3 className="text-2xl font-bold text-white tracking-tight">
            {isCurrency ? formatCurrency(value || 0) : (value || 0).toLocaleString()}
          </h3>
          {growth !== undefined && (
            <p className={`text-[10px] font-bold uppercase tracking-widest mt-2 flex items-center gap-1 ${isPositive ? "text-white" : isNegative ? "text-neutral-500" : "text-neutral-600"}`}>
              {isPositive ? <TrendingUp className="h-3 w-3" /> : isNegative ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
              {Math.abs(growth)}% vs last month
            </p>
          )}
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-800 border border-neutral-700">
          <Icon className="h-5 w-5 text-yellow-500" />
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([dashboardAPI.getStats(), analyticsAPI.getOverview()])
      .then(([s, a]) => { setStats(s.data.stats); setAnalytics(a.data.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  )

  const s = stats || {}
  const a = analytics || {}

  return (
    <div className="space-y-6 animate-fade-in pb-20">

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-sm text-neutral-500 mt-1">Real-time store metrics and insights</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Revenue"   value={s.revenue?.total}            isCurrency icon={DollarSign}  growth={s.revenue?.growthPercent} />
        <StatCard title="Total Orders"    value={s.orders?.total}             icon={ShoppingCart}           growth={s.orders?.growthPercent} />
        <StatCard title="Total Customers" value={s.customers?.total}          icon={Users}                  growth={s.customers?.growthPercent} />
        <StatCard title="Total Products"  value={s.inventory?.totalProducts}  icon={Package} />
      </div>

      {/* Alerts */}
      {(s.inventory?.outOfStock > 0 || s.inventory?.lowStock > 0 || s.orders?.pendingCount > 0) && (
        <div className="flex flex-wrap gap-3">
          {s.inventory?.outOfStock > 0 && (
            <Link to="/products?status=Out+of+Stock"
              className="flex items-center gap-2 rounded-xl border border-neutral-700 px-4 py-2.5 text-[11px] font-bold text-white uppercase tracking-widest hover:border-yellow-600/40 transition-colors">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              {s.inventory.outOfStock} Out of Stock
            </Link>
          )}
          {s.inventory?.lowStock > 0 && (
            <Link to="/products/low-stock"
              className="flex items-center gap-2 rounded-xl border border-neutral-700 px-4 py-2.5 text-[11px] font-bold text-white uppercase tracking-widest hover:border-yellow-600/40 transition-colors">
              <AlertCircle className="h-4 w-4 text-neutral-400" />
              {s.inventory.lowStock} Low on Stock
            </Link>
          )}
          {s.orders?.pendingCount > 0 && (
            <Link to="/orders?currentStatus=Pending"
              className="flex items-center gap-2 rounded-xl border border-neutral-700 px-4 py-2.5 text-[11px] font-bold text-white uppercase tracking-widest hover:border-yellow-600/40 transition-colors">
              <ShoppingCart className="h-4 w-4 text-neutral-400" />
              {s.orders.pendingCount} Pending Orders
            </Link>
          )}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Revenue Chart */}
        <div className="border border-neutral-800 rounded-2xl p-6 xl:col-span-2">
          <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-6">Revenue — Last 30 Days</h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={a.dailyRevenue || []} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#d4a017" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#d4a017" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#525252", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(d) => d?.slice(5)} />
                <YAxis tick={{ fill: "#525252", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `GH₵${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v) => [`GH₵${v.toLocaleString()}`, "Revenue"]}
                  labelStyle={{ color: "#a3a3a3", fontWeight: "bold", fontSize: 11 }}
                  contentStyle={{ backgroundColor: "#0a0a0a", borderColor: "#262626", color: "#fff", borderRadius: "10px", fontSize: 12 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#d4a017" strokeWidth={2} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Pie */}
        <div className="border border-neutral-800 rounded-2xl p-6 flex flex-col">
          <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">Orders by Status</h3>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={a.ordersByStatus || []} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={4} stroke="none">
                  {(a.ordersByStatus || []).map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#0a0a0a", borderColor: "#262626", color: "#fff", borderRadius: "10px", fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="space-y-1.5 mt-2">
            {(a.ordersByStatus || []).map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-neutral-400 font-medium">{item.status}</span>
                </div>
                <span className="font-bold text-white">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Recent Orders */}
        <div className="border border-neutral-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Recent Orders</h3>
            <Link to="/orders" className="text-[10px] uppercase font-bold tracking-widest text-yellow-500 hover:text-yellow-400 transition-colors">View all</Link>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-neutral-800">
                <th className="px-6 py-3 text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Order</th>
                <th className="px-6 py-3 text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Customer</th>
                <th className="px-6 py-3 text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Total</th>
                <th className="px-6 py-3 text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {(s.recentOrders || []).map((o) => (
                <tr key={o._id} className="hover:bg-neutral-900/40 transition-colors">
                  <td className="px-6 py-3.5">
                    <Link to={`/orders/${o._id}`} className="font-mono text-sm font-bold text-yellow-500 hover:text-yellow-400">
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-3.5 text-sm font-medium text-white">{o.customerDetails?.name || "Guest"}</td>
                  <td className="px-6 py-3.5 text-sm font-bold text-white">{formatCurrency(o.total)}</td>
                  <td className="px-6 py-3.5"><span className={getStatusStyle(o.currentStatus)}>{o.currentStatus}</span></td>
                </tr>
              ))}
              {(!s.recentOrders || s.recentOrders.length === 0) && (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-sm text-neutral-600 font-medium">No recent orders</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Recent Activity */}
        <div className="border border-neutral-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-neutral-800">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Recent Activity</h3>
            <Link to="/accounts" className="text-[10px] uppercase font-bold tracking-widest text-yellow-500 hover:text-yellow-400 transition-colors">View logs</Link>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {(s.recentActivity || []).map((log) => (
              <div key={log._id} className="flex gap-3 py-2 border-b border-neutral-800/50 last:border-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-800 text-yellow-500 text-xs font-bold">
                  {log.adminName?.[0]?.toUpperCase() || "A"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-neutral-300 leading-snug">
                    <b className="font-bold text-white">{log.adminName || "System"}</b>
                    {" · "}
                    <span className="text-neutral-500 text-xs">{log.action.replace(/_/g, " ").toLowerCase()}</span>
                  </p>
                  {log.target && <p className="font-medium text-neutral-500 text-xs mt-0.5 truncate">{log.target}</p>}
                  <p className="text-[10px] font-mono text-neutral-700 mt-1 uppercase tracking-widest">
                    {formatRelativeTime(log.createdAt)}
                  </p>
                </div>
              </div>
            ))}
            {(!s.recentActivity || s.recentActivity.length === 0) && (
              <div className="py-8 text-center text-sm text-neutral-600">No recent activity</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}