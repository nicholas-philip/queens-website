import { useEffect, useState }           from "react"
import { useParams, Link }               from "react-router-dom"
import { ArrowLeft, Package, Truck, User, Mail, Phone, MapPin, Calendar, Clock, CreditCard, Receipt, ChevronRight, Activity, Info, CheckCircle2 } from "lucide-react"
import { ordersAPI }                     from "../../libs/api"
import { formatCurrency, formatDateTime, getStatusBadge, cn } from "../../libs/utils"
import { useToast }                      from "../../context/ToastContext"
import Spinner                           from "../../components/Spinner"
import Modal                             from "../../components/Modal"

const STATUSES = ["Pending","Processing","Shipped","Delivered","Cancelled"]

export default function OrderDetailPage() {
  const { id } = useParams()
  const toast  = useToast()

  const [order,       setOrder]       = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [statusModal, setStatusModal] = useState(false)
  const [trackModal,  setTrackModal]  = useState(false)
  const [newStatus,   setNewStatus]   = useState("")
  const [statusNote,  setStatusNote]  = useState("")
  const [tracking,    setTracking]    = useState("")
  const [saving,      setSaving]      = useState(false)

  useEffect(() => {
    ordersAPI.getById(id)
      .then(({ data }) => { setOrder(data.order); setNewStatus(data.order.currentStatus) })
      .catch(() => toast.error("Error", "Order not found."))
      .finally(() => setLoading(false))
  }, [id, toast])

  const updateStatus = async () => {
    setSaving(true)
    try {
      const { data } = await ordersAPI.updateStatus(id, { status: newStatus, note: statusNote })
      setOrder(data.order)
      toast.success("Updated", `Order status set to ${newStatus}`)
      setStatusModal(false); setStatusNote("")
    } catch (err) { toast.error("Error", err.response?.data?.message || "Failed to update status") }
    finally { setSaving(false) }
  }

  const addTracking = async () => {
    if (!tracking.trim()) return
    setSaving(true)
    try {
      const { data } = await ordersAPI.addTracking(id, { trackingNumber: tracking })
      setOrder((p) => ({ ...p, trackingNumber: data.trackingNumber, currentStatus: data.currentStatus }))
      toast.success("Tracking Added", `Reference: ${tracking}`)
      setTrackModal(false); setTracking("")
    } catch (err) { toast.error("Error", err.response?.data?.message || "Failed to add tracking") }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-screen bg-black"><Spinner size="xl" /></div>
  if (!order)  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-neutral-500">
        <Package className="h-16 w-16 mb-4 opacity-20" />
        <h2 className="text-xl font-bold text-white">Order Not Found</h2>
        <p className="mt-2 mb-6">The requested order ID doesn't exist in our records.</p>
        <Link to="/orders" className="px-6 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-bold text-white">Return to Orders</Link>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-20">
      
      {/* ── Top Navigation ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
            <Link to="/orders" className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-500 hover:text-white transition-all group">
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-white tracking-tight">{order.orderNumber}</h1>
                    <span className={cn(
                        "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border",
                        order.currentStatus === 'Delivered' ? "bg-green-500/10 border-green-500/20 text-green-500" : 
                        order.currentStatus === 'Cancelled' ? "bg-red-500/10 border-red-500/20 text-red-500" :
                        "bg-yellow-500/10 border-yellow-500/20 text-yellow-500"
                    )}>
                        {order.currentStatus}
                    </span>
                </div>
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mt-2">{formatDateTime(order.createdAt)}</p>
            </div>
        </div>

        <div className="flex items-center gap-3">
            {!order.trackingNumber && order.currentStatus !== "Delivered" && order.currentStatus !== "Cancelled" && (
                <button 
                    onClick={() => setTrackModal(true)} 
                    className="px-5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-bold text-neutral-400 hover:text-white hover:border-neutral-700 transition-all flex items-center gap-2"
                >
                    <Truck className="h-4 w-4" /> Add Tracking
                </button>
            )}
            <button 
                onClick={() => setStatusModal(true)} 
                className="px-6 py-2.5 bg-yellow-500 rounded-xl text-xs font-bold text-black hover:bg-yellow-400 transition-all flex items-center gap-2 shadow-lg shadow-yellow-500/20"
            >
                <Package className="h-4 w-4" /> Update Status
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ── Left Column: Items & Timeline ── */}
        <div className="lg:col-span-8 space-y-8">
            
            {/* Tracking Banner if active */}
            {order.trackingNumber && (
                <div className="bg-yellow-500 rounded-3xl p-6 flex items-center justify-between shadow-xl shadow-yellow-500/10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-black/10 rounded-2xl">
                            <Truck className="h-6 w-6 text-black" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-black/60 uppercase tracking-widest leading-none mb-1.5">Shipping Reference</p>
                            <p className="text-xl font-bold text-black tracking-tight">{order.trackingNumber}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Items */}
            <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-neutral-800/50 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Order Consignment</h3>
                    <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">{order.items?.length} Items</span>
                </div>
                <div className="divide-y divide-neutral-800">
                    {order.items?.map((item, i) => (
                        <div key={i} className="p-6 flex items-center justify-between group hover:bg-white/[0.02] transition-colors">
                            <div className="flex items-center gap-5">
                                <div className="h-16 w-16 bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden flex items-center justify-center group-hover:border-neutral-700 transition-all">
                                    {item.image ? (
                                        <img src={item.image} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        <Package className="h-6 w-6 text-neutral-700" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-white group-hover:text-yellow-500 transition-colors">{item.title}</p>
                                    <p className="text-[10px] font-mono text-neutral-600 mt-0.5">{item.SKU}</p>
                                    {item.attributes && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {Object.entries(item.attributes).filter(([,v]) => v).map(([k,v]) => (
                                                <span key={k} className="text-[9px] font-bold text-neutral-500 uppercase tracking-tighter bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 rounded">
                                                    {k}: {v}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-white">{formatCurrency(item.lineTotal)}</p>
                                <p className="text-[10px] font-bold text-neutral-600 mt-1 uppercase tracking-tighter">{formatCurrency(item.price)} × {item.quantity}</p>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Financial Summary */}
                <div className="bg-black/40 p-8 space-y-4">
                    <div className="flex justify-between text-sm text-neutral-500">
                        <span className="font-bold uppercase tracking-widest text-[10px]">Merchant Subtotal</span>
                        <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                    </div>
                    {order.discount > 0 && (
                        <div className="flex justify-between text-sm text-green-500/80">
                            <span className="font-bold uppercase tracking-widest text-[10px]">Applied Discount ({order.couponCode})</span>
                            <span className="font-medium">-{formatCurrency(order.discount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-sm text-neutral-500">
                        <span className="font-bold uppercase tracking-widest text-[10px]">Logistics Fee</span>
                        <span className="font-medium">{formatCurrency(order.shipping || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-neutral-800 pt-6 mt-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-500/10 rounded-xl">
                                <Receipt className="h-4 w-4 text-yellow-500" />
                            </div>
                            <span className="text-sm font-bold text-white uppercase tracking-[0.2em]">Total Amount</span>
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tighter">{formatCurrency(order.total)}</span>
                    </div>
                </div>
            </div>

            {/* Status Timeline */}
            <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-800/50">
                    <div className="flex items-center gap-3">
                        <Activity className="h-5 w-5 text-yellow-500/70" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Order Lifecycle</h3>
                    </div>
                </div>
                <div className="space-y-8 relative">
                    <div className="absolute left-[13px] top-4 bottom-4 w-px bg-neutral-800" />
                    {[...(order.statusHistory || [])].reverse().map((s, i) => (
                        <div key={i} className="flex items-start gap-6 relative group">
                            <div className={cn(
                                "h-7 w-7 rounded-full border-2 border-neutral-950 z-10 flex items-center justify-center transition-all",
                                i === 0 ? "bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]" : "bg-neutral-800 border-neutral-900"
                            )}>
                                {i === 0 ? <CheckCircle2 className="h-4 w-4 text-black" /> : <div className="h-1.5 w-1.5 rounded-full bg-neutral-600" />}
                            </div>
                            <div className="flex-1 pb-4">
                                <div className="flex items-center gap-3">
                                    <p className={cn("text-xs font-bold uppercase tracking-widest", i === 0 ? "text-white" : "text-neutral-500")}>{s.status}</p>
                                    <span className="h-px flex-1 bg-neutral-900/40" />
                                    <p className="text-[10px] font-bold text-neutral-600 uppercase">{formatDateTime(s.changedAt)}</p>
                                </div>
                                {s.note && (
                                    <div className="mt-2 text-sm text-neutral-400 font-medium italic">
                                        "{s.note}"
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* ── Right Column: Customer & Delivery ── */}
        <div className="lg:col-span-4 space-y-8">
            
            {/* Customer Details */}
            <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl p-8 shadow-sm">
                <div className="flex items-center gap-3 pb-4 border-b border-neutral-800/50 mb-6">
                    <User className="h-5 w-5 text-yellow-500/70" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Recipient</h3>
                </div>
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center font-bold text-yellow-500 text-lg shadow-inner">
                            {order.customerDetails?.name?.charAt(0)}
                        </div>
                        <div>
                            <p className="font-bold text-white text-lg leading-tight">{order.customerDetails?.name}</p>
                            <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest mt-1">Loyal Member</p>
                        </div>
                    </div>
                    
                    <div className="space-y-3 pt-4 border-t border-neutral-800/50">
                        <div className="flex items-center gap-3 text-neutral-400 group cursor-pointer hover:text-white transition-colors">
                            <Mail className="h-4 w-4 text-neutral-600 group-hover:text-yellow-500 transition-colors" />
                            <span className="text-sm font-medium">{order.customerDetails?.email || "No email provided"}</span>
                        </div>
                        <div className="flex items-center gap-3 text-neutral-400 group cursor-pointer hover:text-white transition-colors">
                            <Phone className="h-4 w-4 text-neutral-600 group-hover:text-yellow-500 transition-colors" />
                            <span className="text-sm font-medium">{order.customerDetails?.phone}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl p-8 shadow-sm">
                <div className="flex items-center gap-3 pb-4 border-b border-neutral-800/50 mb-6">
                    <MapPin className="h-5 w-5 text-yellow-500/70" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Delivery Route</h3>
                </div>
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-neutral-900 rounded-2xl border border-neutral-800">
                        <Clock className="h-5 w-5 text-neutral-500" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white leading-relaxed">
                            {order.customerDetails?.address?.street}
                        </p>
                        <p className="text-sm font-medium text-neutral-500 mt-1">
                            {order.customerDetails?.address?.city}, {order.customerDetails?.address?.state}
                        </p>
                        <div className="mt-4 px-3 py-1 bg-black/40 border border-neutral-800 rounded-lg inline-flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Verified Address</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Context */}
            <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl p-8 shadow-sm">
                <div className="flex items-center gap-3 pb-4 border-b border-neutral-800/50 mb-6">
                    <CreditCard className="h-5 w-5 text-yellow-500/70" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Payment Context</h3>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-white">Secure Gateway</p>
                        <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest mt-1">Paystack Checkout</p>
                    </div>
                    <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Settled</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* ── Status Update Modal ── */}
      <Modal open={statusModal} onClose={() => setStatusModal(false)} title="Modify Order State">
        <div className="p-8 space-y-8">
            <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl flex items-center gap-4">
                <Info className="h-5 w-5 text-yellow-500 shrink-0" />
                <p className="text-xs text-neutral-400 font-medium leading-relaxed">
                    Changing the order status will trigger automated notifications to the customer and update inventory records.
                </p>
            </div>
            
            <div className="space-y-6">
                <div>
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1 mb-2 block">Primary Status</label>
                    <select 
                        value={newStatus} 
                        onChange={(e) => setNewStatus(e.target.value)} 
                        className="w-full bg-black/40 border border-neutral-800 rounded-2xl px-5 py-3.5 text-sm font-bold text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/30 transition-all cursor-pointer appearance-none"
                    >
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1 mb-2 block">Audit Remark (Optional)</label>
                    <textarea 
                        rows={3} 
                        value={statusNote} 
                        onChange={(e) => setStatusNote(e.target.value)}
                        className="w-full bg-black/40 border border-neutral-800 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/30 transition-all resize-none placeholder:text-neutral-700 font-medium" 
                        placeholder="e.g. Dispatched via Accra Express Logistics" 
                    />
                </div>
            </div>

            <div className="flex items-center justify-between gap-4 pt-4">
                <button onClick={() => setStatusModal(false)} className="px-6 py-2.5 rounded-xl text-xs font-bold text-neutral-500 hover:text-white transition-colors">Abort</button>
                <button 
                    onClick={updateStatus} 
                    disabled={saving} 
                    className="px-10 py-3 bg-yellow-500 rounded-xl text-xs font-bold text-black hover:bg-yellow-400 shadow-xl shadow-yellow-500/20 transition-all disabled:opacity-50"
                >
                    {saving ? <Spinner size="sm" /> : "Commit Change"}
                </button>
            </div>
        </div>
      </Modal>

      {/* ── Tracking Modal ── */}
      <Modal open={trackModal} onClose={() => setTrackModal(false)} title="Logistics Registry">
        <div className="p-8 space-y-8">
            <div className="space-y-4">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest ml-1 block">Carrier Tracking Reference</label>
                <div className="relative">
                    <Truck className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-600" />
                    <input 
                        value={tracking} 
                        onChange={(e) => setTracking(e.target.value)} 
                        className="w-full bg-black/40 border border-neutral-800 rounded-2xl pl-12 pr-5 py-4 text-lg font-bold text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/30 transition-all placeholder:text-neutral-700 font-mono" 
                        placeholder="e.g. DHL-593-9201" 
                    />
                </div>
                <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest text-center mt-2.5 italic">Providing this reference allows customers to track their parcels in real-time.</p>
            </div>

            <div className="flex items-center justify-between gap-4 pt-4">
                <button onClick={() => setTrackModal(false)} className="px-6 py-2.5 rounded-xl text-xs font-bold text-neutral-500 hover:text-white transition-colors">Cancel</button>
                <button 
                    onClick={addTracking} 
                    disabled={saving} 
                    className="px-10 py-3 bg-yellow-500 rounded-xl text-xs font-bold text-black hover:bg-yellow-400 shadow-xl shadow-yellow-500/20 transition-all disabled:opacity-50"
                >
                    {saving ? <Spinner size="sm" /> : "Attach Reference"}
                </button>
            </div>
        </div>
      </Modal>
    </div>
  )
}