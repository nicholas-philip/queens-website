import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, ShoppingBag, CreditCard, Activity, ChevronRight, CheckCircle2, AlertCircle, Clock, Package } from "lucide-react"
import { customersAPI, ordersAPI } from "../../libs/api"
import { formatCurrency, formatDate, getStatusBadge, cn } from "../../libs/utils"
import Spinner                           from "../../components/Spinner"
import { useToast }                      from "../../context/ToastContext"
import { Table, TableHead, TableBody, TableRow, TableCell } from "../../components/Table"
    
export default function CustomerDetailPage() {
  const { id } = useParams()
  const toast = useToast()
  
  const [customer, setCustomer] = useState(null)
  const [orders,   setOrders]   = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [{ data: cData }, { data: oData }] = await Promise.all([
          customersAPI.getById(id),
          ordersAPI.getAll({ customerId: id, limit: 5 }) // Recent 5 orders
        ])
        setCustomer(cData.customer)
        setOrders(oData.data)
      } catch {
        toast.error("Error", "Failed to load customer profile.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, toast])

  if (loading) return <div className="flex items-center justify-center h-screen bg-black"><Spinner size="xl" /></div>
  if (!customer) return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-neutral-500">
        <User className="h-16 w-16 mb-4 opacity-20" />
        <h2 className="text-xl font-bold text-white">Customer Not Found</h2>
        <p className="mt-2 mb-6">The requested profile ID doesn't exist in our cluster.</p>
        <Link to="/customers" className="px-6 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-bold text-white">Return to Directory</Link>
    </div>
  )

  const stats = customer.stats || {}

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-20">
      
      {/* ── Top Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
            <Link to="/customers" className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-500 hover:text-white transition-all group shadow-inner">
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-white tracking-tight">{customer.name}</h1>
                    <span className={cn(
                        "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all hover:scale-105 active:scale-95 cursor-default shadow-lg",
                        customer.status === 'Active' ? "bg-green-500/10 border-green-500/20 text-green-500 shadow-green-500/5" : 
                        "bg-red-500/10 border-red-500/20 text-red-500 shadow-red-500/5"
                    )}>
                        {customer.status || 'Active'}
                    </span>
                </div>
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mt-2 flex items-center gap-2">
                    <Calendar className="h-3 w-3" /> Partner since {formatDate(customer.createdAt)}
                </p>
            </div>
        </div>

        <div className="flex items-center gap-3">
            <button className="px-5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-bold text-neutral-400 hover:text-white hover:border-neutral-700 transition-all flex items-center gap-2">
                <Mail className="h-4 w-4" /> Message
            </button>
            <button className="px-6 py-2.5 bg-yellow-500 rounded-xl text-xs font-bold text-black hover:bg-yellow-400 transition-all flex items-center gap-2 shadow-lg shadow-yellow-500/20">
                <CreditCard className="h-4 w-4" /> Billing Context
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ── Left Side: Profile & Metrics ── */}
        <div className="lg:col-span-4 space-y-8">
            
            {/* Primary Profile Card */}
            <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl p-8 shadow-sm flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-3xl bg-neutral-950 border-2 border-neutral-900 flex items-center justify-center font-bold text-yellow-500 text-4xl shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] mb-6 ring-4 ring-yellow-500/5 ring-offset-4 ring-offset-neutral-950">
                    {customer.name?.charAt(0)}
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">{customer.name}</h3>
                <p className="text-sm font-medium text-neutral-500 mt-1">{customer.email || 'No email recorded'}</p>
                
                <div className="w-full h-px bg-neutral-800/50 my-8" />
                
                <div className="w-full space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-black/20 border border-neutral-900/50 rounded-2xl group cursor-pointer hover:border-neutral-700 transition-all">
                        <div className="p-2 bg-neutral-950 border border-neutral-800 rounded-lg group-hover:bg-yellow-500/10 group-hover:border-yellow-500/20 transition-all">
                            <Phone className="h-4 w-4 text-neutral-500 group-hover:text-yellow-500 transition-colors" />
                        </div>
                        <span className="text-xs font-bold text-neutral-300 tracking-wider transition-colors group-hover:text-white">{customer.phone}</span>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-black/20 border border-neutral-900/50 rounded-2xl group cursor-pointer hover:border-neutral-700 transition-all">
                        <div className="p-2 bg-neutral-950 border border-neutral-800 rounded-lg group-hover:bg-yellow-500/10 group-hover:border-yellow-500/20 transition-all">
                            <MapPin className="h-4 w-4 text-neutral-500 group-hover:text-yellow-500 transition-colors" />
                        </div>
                        <div className="text-left">
                            <p className="text-xs font-bold text-neutral-300 tracking-wide transition-colors group-hover:text-white capitalize">{customer.address?.city}, {customer.address?.state}</p>
                            <p className="text-[10px] font-medium text-neutral-600 mt-1 uppercase tracking-tighter">Verified Delivery Hub</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance KPIs */}
            <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl p-8 space-y-6 shadow-sm">
                <div className="flex items-center gap-3 pb-2 border-b border-neutral-800/50">
                    <Activity className="h-5 w-5 text-yellow-500/70" />
                    <h2 className="text-sm font-bold text-white tracking-widest uppercase">Performance Stats</h2>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-neutral-900/50">
                        <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Lifetime Value</span>
                        <span className="text-lg font-bold text-white tracking-tighter">{formatCurrency(stats.totalSpent || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-neutral-900/50">
                        <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Order Fulfillment</span>
                        <span className="text-lg font-bold text-white tracking-tighter">{stats.orderCount || 0} Ships</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-neutral-900/50">
                        <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Merchant Tier</span>
                        <span className="px-3 py-1 bg-yellow-500 rounded-lg text-black text-[10px] font-bold uppercase tracking-widest">Elite</span>
                    </div>
                </div>
            </div>
        </div>

        {/* ── Right Column: Order History ── */}
        <div className="lg:col-span-8 space-y-8">
            
            {/* Recent Orders Table */}
            <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-8 border-b border-neutral-800/50 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-white tracking-tight">Consignment Registry</h3>
                        <p className="text-xs text-neutral-500 mt-1 uppercase tracking-widest font-bold">Recent activity and fulfillment</p>
                    </div>
                    <Link to={`/orders?customerId=${id}`} className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-[10px] font-bold text-neutral-400 hover:text-white hover:border-neutral-700 transition-all uppercase tracking-widest">
                        View Legacy
                    </Link>
                </div>
                
                <Table>
                    <TableHead headers={["Order ID", "Date", "Items", "Investment", "Status"]} />
                    <TableBody>
                        {orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5}>
                                    <div className="py-20 text-center flex flex-col items-center justify-center opacity-40">
                                        <Package className="h-10 w-10 mb-4" />
                                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-neutral-500">No consignment history found.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow key={order._id}>
                                    <TableCell>
                                        <Link to={`/orders/${order._id}`} className="font-bold text-yellow-500 hover:text-yellow-400 text-sm">
                                            {order.orderNumber}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-neutral-500 truncate max-w-[120px]">
                                            <Clock className="h-3 w-3 shrink-0" />
                                            <span className="text-xs font-bold">{formatDate(order.createdAt)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-xs font-bold text-neutral-400">{order.items?.length || 0} Modules</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-bold text-white">{formatCurrency(order.total)}</span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "w-1.5 h-1.5 rounded-full shadow-[0_0_8px]",
                                                order.currentStatus === 'Delivered' ? "bg-green-500 shadow-green-500/50" : 
                                                order.currentStatus === 'Cancelled' ? "bg-red-500 shadow-red-500/50" : "bg-yellow-500 shadow-yellow-500/50"
                                            )} />
                                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                                                {order.currentStatus}
                                            </span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Quick Actions / Store Context */}
            <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="group">
                    <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <AlertCircle className="h-3 w-3 text-red-500" /> Administrative Risk
                    </h4>
                    <div className="bg-black/40 border border-neutral-800 rounded-2xl p-6 transition-all group-hover:border-red-500/20">
                        <p className="text-xs text-neutral-400 font-medium leading-relaxed mb-6">
                            Restrict this partner from placing new orders on the storefront.
                        </p>
                        <button className="w-full py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-bold text-red-500 uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                            Restrict Partner Access
                        </button>
                    </div>
                </div>
                <div>
                    <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-500" /> Verified Status
                    </h4>
                    <div className="bg-black/40 border border-neutral-800 rounded-2xl p-6">
                        <p className="text-xs text-neutral-400 font-medium leading-relaxed mb-6">
                            This account has been verified against our KYC standards and is eligible for global shipping.
                        </p>
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-green-500/5 border border-green-500/10 rounded-xl text-green-500 font-bold text-[10px] uppercase tracking-widest justify-center">
                            Verified Since 2024
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}