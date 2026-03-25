import { useEffect, useState } from "react"
import { analyticsAPI } from "../../libs/api"
import { formatCurrency } from "../../libs/utils"
import Spinner from "../../components/Spinner"
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import { Calendar, TrendingUp, Package, Tag, Star } from "lucide-react"

/* Strict 3-color palette: gold, white, neutral */
const PIE_COLORS = ["#d4a017", "#ffffff", "#737373", "#404040", "#262626"]

const TOOLTIP_STYLE = {
  backgroundColor: "#0a0a0a",
  border: "1px solid #262626",
  borderRadius: "10px",
  fontSize: "12px",
  color: "#fff",
}

const LABEL_STYLE = {
  color: "#737373",
  fontWeight: 700,
  fontSize: 11,
}

export default function AnalyticsPage() {
  const [data, setData] = useState(null)
  const [days, setDays] = useState(30)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      analyticsAPI.getRevenue(days),
      analyticsAPI.getOrderStatus(),
      analyticsAPI.getTopProducts(10),
      analyticsAPI.getCategories(),
    ])
      .then(([r, o, p, c]) => setData({
        revenue:     r.data.data,
        orderStatus: o.data.data,
        products:    p.data.data,
        categories:  c.data.data,
      }))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [days])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner size="xl" />
    </div>
  )

  const maxSold = data?.products?.[0]?.totalSold || 1

  return (
    <div className="space-y-6 animate-fade-in pb-20">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Analytics</h1>
          <p className="text-sm text-neutral-500 mt-1">Sales performance and store insights</p>
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500 pointer-events-none" />
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-8 py-2 text-xs font-bold text-white focus:outline-none appearance-none cursor-pointer hover:bg-neutral-800 transition-colors"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      {/* ── Revenue Area Chart ── */}
      <div className="border border-neutral-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-yellow-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Revenue</h3>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Last {days} days</p>
          </div>
        </div>

        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.revenue || []} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#d4a017" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#d4a017" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#525252", fontWeight: 600 }}
                tickFormatter={(d) => d?.slice(5)}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#525252", fontWeight: 600 }}
                tickFormatter={(v) => `GH₵${(v / 1000).toFixed(0)}k`}
                width={52}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                labelStyle={LABEL_STYLE}
                formatter={(v) => [formatCurrency(v), "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#d4a017"
                strokeWidth={2}
                fill="url(#revenueGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "#d4a017", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Two column: Pie + Bar ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Orders by Status — Pie */}
        <div className="border border-neutral-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center">
              <Package className="h-4 w-4 text-neutral-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Order Fulfilment</h3>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">By status</p>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.orderStatus || []}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {(data?.orderStatus || []).map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    itemStyle={{ color: "#fff" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {(data?.orderStatus || []).map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-[11px] font-medium text-neutral-400">{item.status}</span>
                  </div>
                  <span className="text-[11px] font-bold text-white ml-3">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue by Category — Horizontal Bar */}
        <div className="border border-neutral-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center">
              <Tag className="h-4 w-4 text-neutral-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Sales by Category</h3>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Revenue breakdown</p>
            </div>
          </div>

          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data?.categories || []}
                layout="vertical"
                margin={{ left: 0, right: 10, top: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" horizontal={false} />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#525252", fontWeight: 600 }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                  dataKey="category"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#a3a3a3", fontWeight: 600 }}
                  width={90}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  contentStyle={TOOLTIP_STYLE}
                  labelStyle={LABEL_STYLE}
                  formatter={(v) => [formatCurrency(v), "Revenue"]}
                />
                <Bar dataKey="revenue" fill="#d4a017" radius={[0, 4, 4, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Top Products ── */}
      <div className="border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-neutral-800">
          <div className="h-8 w-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center">
            <Star className="h-4 w-4 text-yellow-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Top Products</h3>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">By units sold</p>
          </div>
        </div>

        <div className="divide-y divide-neutral-800/60">
          {(data?.products || []).map((p, i) => (
            <div key={p._id} className="flex items-center gap-5 px-6 py-4 hover:bg-neutral-900/40 transition-colors group">

              {/* Rank */}
              <span className="text-xs font-bold text-neutral-700 w-5 shrink-0 text-center">{i + 1}</span>

              {/* Image */}
              <div className="h-10 w-10 shrink-0 rounded-xl bg-neutral-800 border border-neutral-700 overflow-hidden">
                {p.images?.[0]
                  ? <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />
                  : <div className="h-full w-full flex items-center justify-center text-neutral-600 text-xs font-bold uppercase">{p.title?.[0]}</div>
                }
              </div>

              {/* Title + rating */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{p.title}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{p.totalSold} sold</span>
                  {p.averageRating && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-500">
                      <Star className="h-2.5 w-2.5 fill-yellow-500" />
                      {p.averageRating}
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="hidden md:block w-40 shrink-0">
                <div className="h-1 rounded-full bg-neutral-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-yellow-500 transition-all duration-700"
                    style={{ width: `${Math.min((p.totalSold / maxSold) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Count */}
              <span className="text-sm font-bold text-white w-10 text-right shrink-0">{p.totalSold}</span>
            </div>
          ))}

          {(!data?.products || data.products.length === 0) && (
            <div className="px-6 py-10 text-center text-sm text-neutral-600">No product data available</div>
          )}
        </div>
      </div>
    </div>
  )
}