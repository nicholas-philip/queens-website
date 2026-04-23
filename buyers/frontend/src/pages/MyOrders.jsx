import React, { useEffect, useState } from 'react';
import { Package, Clock, Truck, CheckCircle, ChevronRight, ShoppingBag, ArrowLeft, ExternalLink, Search, AlertCircle, Loader2, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

// Queens Fashion admin WhatsApp number
const QUEENS_WHATSAPP = '233536479169';

const OrderCard = ({ order }) => {
  const isDelivered = order.currentStatus === 'Delivered';
  const isShipped = order.currentStatus === 'Shipped';

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':    return <Clock size={16} />;
      case 'Processing': return <Package size={16} />;
      case 'Delivered':  return <CheckCircle size={16} />;
      default:           return <Package size={16} />;
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Pending':    return 'bg-warning/20 text-warning border-warning/30';
      case 'Processing': return 'bg-info/20 text-info border-info/30';
      case 'Delivered':  return 'bg-success/20 text-success border-success/30';
      default:           return 'bg-error/20 text-error border-error/30';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-base-100 border border-base-200 rounded-[1.5rem] p-5 sm:p-6 hover:border-primary/30 transition-all duration-300 shadow-sm"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-xs font-bold text-base-content/40 uppercase tracking-widest">Order ID</span>
            <span className="text-sm font-black text-base-content tracking-tight">{order.orderNumber}</span>
          </div>
          <p className="text-xs text-base-content/60 font-medium">Placed on {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-2">
          {order.paymentStatus === 'Paid' && (
            <div className="px-3 py-1.5 rounded-lg border border-success/30 bg-success/10 text-success text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
               <CheckCircle size={12} /> PAID
            </div>
          )}
          <div className={`px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-transform group-hover:scale-105 shadow-sm ${getStatusStyles(order.currentStatus)}`}>
             {getStatusIcon(order.currentStatus)}
             {order.currentStatus}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {order.items?.slice(0, 2).map((item, idx) => (
          <div key={idx} className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-base-200 border border-base-300 overflow-hidden shrink-0">
               <img src={item.image || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=200'} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
               <p className="text-sm font-bold text-base-content truncate">{item.title}</p>
               <p className="text-xs font-bold text-base-content/40 uppercase tracking-widest">Qty: {item.quantity}</p>
            </div>
          </div>
        ))}
        {order.items?.length > 2 && (
          <p className="text-xs font-black text-primary uppercase tracking-widest pl-1">+ {order.items.length - 2} more items</p>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-base-200 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div className="space-y-1">
          {order.shipping > 0 && (
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-base-content/40 uppercase tracking-widest">Delivery Fee</p>
              <p className="text-xs font-black text-warning">GHS {order.shipping.toFixed(2)} <span className="text-base-content/30 font-medium">(pay rider)</span></p>
            </div>
          )}
          <div>
            <p className="text-xs font-bold text-base-content/40 uppercase tracking-widest mb-0.5">Order Total</p>
            <div className="flex items-center gap-2">
              <p className="text-lg font-black text-base-content tracking-tight">GHS {order.total.toFixed(2)}</p>
              {order.paymentStatus === 'Paid' && (
                <span className="px-2 py-0.5 rounded-md border border-success/30 bg-success/10 text-success text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle size={10} /> Paid
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
            <a
              href={`https://wa.me/${QUEENS_WHATSAPP}?text=${encodeURIComponent(`Hi Queens Fashion! I'm checking on my order *${order.orderNumber}*. Could you please give me an update? 🙏`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 text-xs font-black text-[#25D366] hover:bg-[#25D366]/20 transition-all"
            >
               <MessageCircle size={14} /> Ask on WhatsApp
            </a>
            <Link 
              to={`/track?id=${order.orderNumber}`}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-base-200 border border-base-300 text-xs font-black text-base-content/60 hover:bg-base-300 hover:text-base-content transition-all"
            >
               Track Status <ChevronRight size={14} />
            </Link>
        </div>
      </div>
    </motion.div>
  );
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimId, setClaimId] = useState('');
  const [showClaim, setShowClaim] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/orders/my-history');
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleClaim = async (e) => {
    e.preventDefault();
    if (!claimId.trim()) return;
    setClaiming(true);
    try {
      const { data } = await api.patch('/orders/claim-secure', { orderNumber: claimId });
      alert(data.message);
      setClaimId('');
      setShowClaim(false);
      fetchHistory(); // Refresh
    } catch (err) {
      alert(err.response?.data?.message || 'Order match failed.');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200/40 pt-24 pb-20 font-sans relative">
      
      {/* Search Overlay/Modal */}
      <AnimatePresence>
        {showClaim && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 ">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-base-100 rounded-[2.5rem] border border-base-200 p-8 sm:p-10 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowClaim(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-2xl bg-base-200 flex items-center justify-center text-base-content/40 hover:text-base-content transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6">
                  <Search size={32} />
                </div>
                <h2 className="text-2xl font-black text-base-content tracking-tighter">Locate Missing Order</h2>
                <p className="text-sm text-base-content/50 font-medium mt-2">Enter your order ID to sync it with your device.</p>
              </div>

              <form onSubmit={handleClaim} className="space-y-4">
                <input 
                  autoFocus
                  placeholder="e.g. QN-2404-XXXX"
                  value={claimId}
                  onChange={(e) => setClaimId(e.target.value)}
                  className="w-full bg-base-200 border border-base-300 rounded-2xl px-6 py-4 text-base-content font-bold placeholder:text-base-content/20 focus:border-primary outline-none transition-all uppercase"
                />
                <button 
                  disabled={claiming || !claimId.trim()}
                  className="w-full py-4 bg-primary text-primary-content rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {claiming ? 'Synchronizing...' : 'Find and Link Order'}
                </button>
              </form>
              <p className="mt-6 flex items-start gap-2 text-xs text-base-content/40 font-bold uppercase tracking-wider leading-relaxed">
                <AlertCircle size={14} className="shrink-0" />
                This will move the order into your permanent history list for easier tracking.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black text-base-content tracking-tighter">My Orders</h1>
            <p className="text-base-content/50 font-medium text-sm sm:text-base tracking-tight italic">Secure device history</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
             <button 
               onClick={() => setShowClaim(true)}
               className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-xs font-black text-primary uppercase tracking-widest hover:bg-primary/20 transition-all font-mono"
             >
                Lost an order? <Search size={14} />
             </button>
             <Link to="/shop" className="flex items-center gap-2 text-xs font-black text-base-content/40 uppercase tracking-widest group">
               <ShoppingBag size={14} /> Continue Shopping
               <div className="w-0 h-px bg-base-content/20 group-hover:w-full transition-all duration-300" />
             </Link>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-base-100 rounded-[1.5rem] border border-base-200 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-base-100 border border-base-200 rounded-[2rem] p-12 sm:p-20 text-center flex flex-col items-center shadow-sm">
             <div className="w-20 h-20 bg-base-200 rounded-3xl flex items-center justify-center text-base-content/20 mb-8 transform -rotate-12">
               <ShoppingBag size={40} />
             </div>
             <h2 className="text-2xl font-black text-base-content tracking-tight mb-4">No Orders Found</h2>
             <p className="text-base-content/50 font-medium max-w-sm mx-auto mb-10 text-sm leading-relaxed">
               It looks like you haven't placed any orders from this device yet. Start your luxury journey with us today.
             </p>
             <Link to="/shop" className="btn btn-primary rounded-2xl px-12 py-4 font-black h-auto text-sm shadow-xl shadow-primary/20">
               Browse Collections
             </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
             <AnimatePresence>
               {orders.map((order) => (
                 <OrderCard key={order.orderNumber} order={order} />
               ))}
             </AnimatePresence>
          </div>
        )}

        {/* Footer Help */}
        <div className="mt-16 text-center space-y-4">
           <p className="text-xs font-black text-base-content/30 uppercase tracking-[0.2em]">Have an issue with an order?</p>
           <div className="flex justify-center gap-6">
              <Link to="/contact" className="text-xs font-bold text-base-content/60 hover:text-primary transition-colors flex items-center gap-2">
                Contact Concierge <ExternalLink size={12} />
              </Link>
              <Link to="/returns" className="text-xs font-bold text-base-content/60 hover:text-primary transition-colors flex items-center gap-2">
                Returns & Exchanges <ExternalLink size={12} />
              </Link>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MyOrders;

