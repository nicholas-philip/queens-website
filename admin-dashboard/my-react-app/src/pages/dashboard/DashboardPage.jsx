import { useEffect, useState }                                  from "react"
import { Link }                                                 from "react-router-dom"
import { DollarSign, ShoppingCart, Users, Package, AlertCircle, ArrowUpRight, Clock, TrendingUp, Activity } from "lucide-react"
import { dashboardAPI, analyticsAPI }                           from "../../libs/api"
import { formatCurrency, formatRelativeTime, getStatusBadge }   from "../../libs/utils"
import StatCard                                                 from "../../components/dashboard/StatCard"
import Spinner                                                   from "../../components/Spinner"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts"

const PIE_COLORS = ["#eab308","#22c55e","#3b82f6","#ef4444","#8b5cf6"]

export default function DashboardPage() {
  const [stats,    setStats]    = useState(null)
  const [analytics,setAnalytics]= useState(null)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    Promise.all([dashboardAPI.getStats(), analyticsAPI.getOverview()])
      .then(([s, a]) => { setStats(s.data.stats); setAnalytics(a.data.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner size="xl" />
    </div>
  )

  const s = stats || {}
  const a = analytics || {}

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header section with quick actions or welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Store Overview</h1>
            <p className="text-sm text-neutral-500 mt-1">Real-time performance indicators and key metrics.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Live Feed
            </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Total Revenue"   value={s.revenue?.total}   isCurrency icon={DollarSign}   color="yellow" growth={s.revenue?.growthPercent} />
        <StatCard title="Total Orders"    value={s.orders?.total}    icon={ShoppingCart} color="green"  growth={s.orders?.growthPercent} />
        <StatCard title="Total Customers" value={s.customers?.total} icon={Users}        color="blue"   growth={s.customers?.growthPercent} />
        <StatCard title="Total Products"  value={s.inventory?.totalProducts} icon={Package} color="yellow" />
      </div>

      {/* ── Alerts & Warnings ── */}
      {(s.inventory?.outOfStock > 0 || s.inventory?.lowStock > 0 || s.orders?.pendingCount > 0) && (
        <div className="bg-neutral-900/30 border border-neutral-800/50 rounded-2xl p-2 flex flex-wrap gap-2">
          {s.inventory?.outOfStock > 0 && (
            <Link to="/products?status=Out+of+Stock"
              className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-500/20 transition-all">
              <AlertCircle className="h-3.5 w-3.5" />
              {s.inventory.outOfStock} items out of stock
            </Link>
          )}
          {s.inventory?.lowStock > 0 && (
            <Link to="/products"
              className="flex items-center gap-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 text-xs font-bold text-yellow-500 hover:bg-yellow-500/20 transition-all">
              <AlertCircle className="h-3.5 w-3.5" />
              {s.inventory.lowStock} products low on stock
            </Link>
          )}
          {s.orders?.pendingCount > 0 && (
            <Link to="/orders?status=Pending"
              className="flex items-center gap-2 rounded-xl bg-blue-500/10 border border-blue-500/20 px-4 py-2 text-xs font-bold text-blue-500 hover:bg-blue-500/20 transition-all">
              <ShoppingCart className="h-3.5 w-3.5" />
              {s.orders.pendingCount} orders awaiting processing
            </Link>
          )}
        </div>
      )}

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Revenue Area Chart */}
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl p-8 xl:col-span-2 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
                <h3 className="text-lg font-bold text-white">Revenue Performance</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Earnings over the last 30 days</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={a.dailyRevenue || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#eab308" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#525252', fontWeight: 600 }} 
                    tickFormatter={(d) => d?.slice(5)} 
                    dy={10}
                />
                <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#525252', fontWeight: 600 }} 
                    tickFormatter={(v) => `₦${(v/1000).toFixed(0)}k`} 
                />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                    itemStyle={{ color: '#eab308' }}
                    formatter={(v) => [`₦${v.toLocaleString()}`, "Revenue"]} 
                />
                <Area type="monotone" dataKey="revenue" stroke="#eab308" strokeWidth={3} fillOpacity={1} fill="url(#rev)" />
                </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Pie Chart */}
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl p-8 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
                <h3 className="text-lg font-bold text-white">Order Status</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Distribution of recent sales</p>
            </div>
          </div>
          
          <div className="h-[250px] w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                <Pie 
                    data={a.ordersByStatus || []} 
                    dataKey="count" 
                    nameKey="status" 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={60}
                    outerRadius={85} 
                    paddingAngle={5}
                    stroke="none"
                >
                    {(a.ordersByStatus || []).map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip 
                     contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                />
                </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-4">
             {(a.ordersByStatus || []).map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{item.status}</span>
                </div>
             ))}
          </div>
        </div>
      </div>

      {/* ── Bottom row ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Recent Orders */}
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-8 py-6 border-b border-neutral-800">
            <h3 className="text-lg font-bold text-white">Recent Orders</h3>
            <Link to="/orders" className="text-xs font-bold text-yellow-500 hover:text-yellow-400 p-2 bg-yellow-500/5 rounded-lg transition-all flex items-center gap-1">
                View All <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-neutral-900/50 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                    <th className="px-8 py-3">Order</th>
                    <th className="px-8 py-3">Customer</th>
                    <th className="px-8 py-3">Total</th>
                    <th className="px-8 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {(s.recentOrders || []).map((o) => (
                  <tr key={o._id} className="hover:bg-neutral-800/30 transition-colors group">
                    <td className="px-8 py-4 font-bold text-yellow-500">
                      <Link to={`/orders/${o._id}`}>{o.orderNumber}</Link>
                    </td>
                    <td className="px-8 py-4 text-white font-medium">{o.customerDetails?.name}</td>
                    <td className="px-8 py-4 font-bold text-white">{formatCurrency(o.total)}</td>
                    <td className="px-8 py-4"><span className={getStatusBadge(o.currentStatus)}>{o.currentStatus}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-white">Staff Activity</h3>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Activity className="h-4 w-4 text-blue-500" />
            </div>
          </div>
          <div className="space-y-6">
            {(s.recentActivity || []).map((log) => (
              <div key={log._id} className="flex items-start gap-4 group">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-800 border border-neutral-700 text-yellow-500 text-xs font-bold shadow-md group-hover:border-yellow-500/30 transition-colors">
                  {log.adminName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-neutral-300">
                    <b className="font-bold text-white">{log.adminName}</b>{" "}
                    <span className="text-neutral-500">{log.action.replace(/_/g, " ").toLowerCase()}</span>
                    {log.target && <span className="text-white font-medium"> · {log.target}</span>}
                  </p>
                  <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatRelativeTime(log.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}