import { useEffect, useState } from "react"
import { analyticsAPI }        from "../../libs/api"
import { formatCurrency }      from "../../libs/utils"
import Spinner                 from "../../components/Spinner"
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts"
import { Calendar, Filter, TrendingUp, PieChart as PieIcon, BarChart3, Star } from "lucide-react"

const COLORS = ["#eab308","#3b82f6","#22c55e","#ef4444","#8b5cf6","#ec4899"]

export default function AnalyticsPage() {
  const [data,    setData]    = useState(null)
  const [days,    setDays]    = useState(30)
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

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Spinner size="xl" /></div>

  return (
    <div className="space-y-8 animate-fade-in">
        
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Analytics & Insights</h1>
            <p className="text-sm text-neutral-500 mt-1">Deep dive into your store's sales and performance data.</p>
        </div>
        <div className="flex items-center gap-3">
             <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
                <select 
                    value={days} 
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-8 py-2 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50 appearance-none cursor-pointer hover:bg-neutral-800 transition-colors"
                >
                    <option value={7}>Last 7 days</option>
                    <option value={30}>Last 30 days</option>
                    <option value={90}>Last 90 days</option>
                </select>
             </div>
        </div>
      </div>

      {/* ── Revenue chart ── */}
      <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-yellow-500" />
            </div>
            <h3 className="text-lg font-bold text-white">Revenue Growth</h3>
        </div>
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.revenue || []}>
                <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
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
                    formatter={(v) => [formatCurrency(v), "Revenue"]} 
                />
                <Area type="monotone" dataKey="revenue" stroke="#eab308" strokeWidth={3} fillOpacity={1} fill="url(#g)" />
            </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Orders by Status */}
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <PieIcon className="h-5 w-5 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-white">Fulfillment Status</h3>
          </div>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                <Pie data={data?.orderStatus || []} dataKey="count" nameKey="status"
                    cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} stroke="none">
                    {(data?.orderStatus || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '12px', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }} />
                </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Category */}
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl p-8 shadow-sm">
           <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="text-lg font-bold text-white">Sales by Category</h3>
          </div>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.categories || []} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="category" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#fff', fontWeight: 600 }} width={80} />
                <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(v) => [formatCurrency(v), "Revenue"]} 
                />
                <Bar dataKey="revenue" fill="#eab308" radius={[0, 6, 6, 0]} barSize={20} />
                </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl p-8 shadow-sm">
        <h3 className="text-lg font-bold text-white mb-8">Performance Leaderboard</h3>
        <div className="space-y-4">
          {(data?.products || []).map((p, i) => (
            <div key={p._id} className="flex items-center gap-6 p-4 rounded-2xl hover:bg-neutral-800/20 transition-all border border-transparent hover:border-neutral-800 group">
              <span className="text-sm font-bold text-neutral-600 w-4 shadow-sm italic">{i + 1}</span>
              <div className="h-12 w-12 shrink-0 rounded-xl bg-neutral-800 border border-neutral-700 overflow-hidden shadow-inner group-hover:border-yellow-500/30 transition-colors">
                {p.images?.[0]
                  ? <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />
                  : <div className="h-full w-full flex items-center justify-center text-neutral-600 text-xs font-bold uppercase">{p.title?.[0]}</div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{p.title}</p>
                <div className="flex items-center gap-3 mt-1 text-[10px] uppercase font-bold tracking-widest text-neutral-500">
                    <span>{p.totalSold} Units Sold</span>
                    <span className="flex items-center gap-1 text-yellow-500">
                        <Star className="h-2.5 w-2.5 fill-yellow-500" /> {p.averageRating}
                    </span>
                </div>
              </div>
              {/* Visual mini-bar */}
              <div className="hidden md:block w-48 h-1.5 rounded-full bg-neutral-800 overflow-hidden shadow-inner mx-4">
                <div className="h-full rounded-full bg-gradient-to-r from-yellow-600 to-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.4)]"
                  style={{ width: `${Math.min((p.totalSold / ((data?.products?.[0]?.totalSold || 1))) * 100, 100)}%` }} />
              </div>
              <span className="text-sm font-bold text-white w-12 text-right">{p.totalSold}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}