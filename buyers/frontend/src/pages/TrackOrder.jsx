import React, { useState } from 'react';
import { PackageSearch, ArrowRight, CheckCircle2, Truck, CreditCard, Mail, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api';

const TrackOrder = () => {
  const [trackingId, setTrackingId] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pinning, setPinning] = useState(false);

  const handleClaim = async () => {
    if (!order?.orderNumber) return;
    setPinning(true);
    try {
      const { data } = await api.patch('/orders/claim-secure', { orderNumber: order.orderNumber });
      alert(data.message);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to sync with history.');
    } finally {
      setPinning(false);
    }
  };

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!trackingId.trim()) return;

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const { data } = await api.get(`/orders/track/${trackingId.trim()}`);
      if (data.success && data.order) {
        setOrder(data.order);
      } else {
        setError('Order not found. Please verify your tracking ID.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not locate an order with that ID.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-warning/20 text-warning border-warning/30',
      'Processing': 'bg-info/20 text-info border-info/30',
      'Shipped': 'bg-secondary/20 text-secondary border-secondary/30',
      'Delivered': 'bg-success/20 text-success border-success/30',
      'Cancelled': 'bg-error/20 text-error border-error/30'
    };
    return colors[status] || 'bg-base-200 text-base-content/70 border-base-300';
  };

  return (
    <div className="min-h-screen bg-base-200/40 pt-24 pb-16 sm:pb-20 font-sans transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12">
          <div className="w-14 sm:w-16 h-14 sm:h-16 bg-base-100 shadow-xl rounded-2xl flex items-center justify-center text-primary mx-auto mb-5 sm:mb-6">
            <PackageSearch size={28} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-base-content tracking-tight mb-3 sm:mb-4">Track Your Order</h1>
          <p className="text-base-content/60 font-medium text-base sm:text-lg max-w-md mx-auto">Enter your tracking ID below to check the current status of your shipment.</p>
        </div>

        {/* Form */}
        <div className="bg-base-100 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 md:p-10 shadow-sm border border-base-200 mb-6 sm:mb-8">
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <input 
              type="text" 
              placeholder="e.g. QN-240402-A1B2" 
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              className="flex-grow bg-base-200 border border-base-300 rounded-xl px-4 sm:px-6 py-3.5 sm:py-4 text-base-content font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:font-medium placeholder:text-base-content/30 uppercase"
            />
            <button 
              type="submit" 
              disabled={loading || !trackingId.trim()}
              className="btn btn-primary rounded-xl px-6 sm:px-10 py-4 font-extrabold disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
            >
              {loading ? 'Searching...' : 'Track'} <ArrowRight size={18} />
            </button>
          </form>
          {error && <p className="text-error font-semibold mt-4 text-center text-sm">{error}</p>}
        </div>

        {/* Results */}
        {order && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-base-100 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 md:p-10 shadow-sm border border-base-200"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4 border-b border-base-200 pb-6 sm:pb-8">
               <div>
                  <p className="text-xs font-bold text-base-content/40 tracking-wider uppercase mb-1">Order Ref</p>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-base-content">{order.orderNumber}</h2>
               </div>
               <div className="flex items-center gap-3">
                  <button 
                    onClick={handleClaim} 
                    disabled={pinning}
                    className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-xs font-black text-primary uppercase tracking-widest hover:bg-primary/20 transition-all flex items-center gap-1.5"
                  >
                    {pinning ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    {pinning ? 'Syncing...' : 'Pin to My History'}
                  </button>
                  <span className={`px-4 sm:px-5 py-2 rounded-xl border font-extrabold tracking-wide text-sm ${getStatusColor(order.currentStatus)}`}>
                    {order.currentStatus}
                  </span>
               </div>
            </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-10">
               <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-base-200 flex items-center justify-center text-base-content/40 flex-shrink-0"><Truck size={22} /></div>
                  <div>
                     <p className="text-xs font-bold text-base-content/40 uppercase tracking-wider mb-1">Shipping To</p>
                     <p className="font-bold text-base-content leading-relaxed text-sm">
                       {/* Privacy Masking for Address */}
                       {order.customerDetails?.address?.street?.split(' ').map((word, i) => i === 0 ? word : '***').join(' ')}<br/>
                       {order.customerDetails?.address?.city}, {order.customerDetails?.address?.country}
                     </p>
                  </div>
               </div>
               <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-base-200 flex items-center justify-center text-base-content/40 flex-shrink-0"><Mail size={22} /></div>
                  <div>
                     <p className="text-xs font-bold text-base-content/40 uppercase tracking-wider mb-1">Contact Email</p>
                     <p className="font-extrabold text-base-content flex items-center gap-2 text-sm">
                       {/* Privacy Masking for Email */}
                       {order.customerDetails?.email ? 
                          order.customerDetails.email.replace(/(.{2})(.*)(?=@)/, (gp1, gp2, gp3) => gp2 + "*".repeat(gp3.length)) : 
                          "Not provided"}
                     </p>
                  </div>
               </div>
            </div>

            <div className="bg-base-200/50 rounded-2xl p-4 sm:p-6">
               <h3 className="font-extrabold text-base-content mb-4 text-sm uppercase tracking-widest">Order Consignment</h3>
               <div className="space-y-3 sm:space-y-4">
                 {order.items?.map((item, idx) => (
                   <div key={idx} className="flex justify-between items-center bg-base-100 p-3 sm:p-4 rounded-xl shadow-sm border border-base-200">
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                         <div className="w-10 sm:w-12 h-10 sm:h-12 bg-base-200 rounded-lg overflow-hidden border border-base-300 flex-shrink-0">
                           <img src={item.image || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=200'} className="w-full h-full object-cover" alt="" />
                         </div>
                         <div className="min-w-0">
                            <p className="font-bold text-base-content line-clamp-1 text-sm">{item.title}</p>
                            <p className="text-xs font-semibold text-base-content/50">Qty: {item.quantity}</p>
                         </div>
                      </div>
                      <p className="font-extrabold text-base-content text-sm shrink-0 ml-2">GHS {item.price}</p>
                   </div>
                 ))}
               </div>
               <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-base-300 flex justify-between items-center">
                  <span className="font-bold text-base-content/50 uppercase tracking-wider text-xs">Total Amount</span>
                  <span className="font-black text-xl sm:text-2xl text-primary">GHS {order.total}</span>
               </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
