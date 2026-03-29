import React, { useState } from 'react';
import { PackageSearch, ArrowRight, CheckCircle2, Truck, CreditCard, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api';

const TrackOrder = () => {
  const [trackingId, setTrackingId] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      'Pending': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'Processing': 'bg-blue-50 text-blue-700 border-blue-200',
      'Shipped': 'bg-purple-50 text-purple-700 border-purple-200',
      'Delivered': 'bg-green-50 text-green-700 border-green-200',
      'Cancelled': 'bg-red-50 text-red-700 border-red-200'
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20 font-sans">
      <div className="max-w-3xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-white shadow-xl rounded-2xl flex items-center justify-center text-green-700 mx-auto mb-6">
            <PackageSearch size={32} />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">Track Your Order</h1>
          <p className="text-gray-500 font-medium text-lg">Enter your tracking ID below to check the current status of your shipment.</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-gray-100 mb-8">
          <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
            <input 
              type="text" 
              placeholder="e.g. QNS-584A-9214" 
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              className="flex-grow bg-gray-50 border border-gray-200 rounded-xl px-6 py-4 text-gray-900 font-bold focus:border-green-700 focus:ring-1 focus:ring-green-700 outline-none transition-all placeholder:font-medium placeholder:text-gray-400"
            />
            <button 
              type="submit" 
              disabled={loading || !trackingId.trim()}
              className="bg-green-700 text-white font-extrabold px-10 py-4 rounded-xl hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? 'Searching...' : 'Track Package'} <ArrowRight size={20} />
            </button>
          </form>
          {error && <p className="text-red-500 font-semibold mt-4 text-center">{error}</p>}
        </div>

        {/* Results */}
        {order && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-gray-100"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-100 pb-8">
               <div>
                  <p className="text-sm font-bold text-gray-400 tracking-wider uppercase mb-1">Order #{order.trackingNumber}</p>
                  <h2 className="text-2xl font-extrabold text-gray-900">{order.customerDetails?.name}</h2>
               </div>
               <span className={`px-5 py-2 rounded-xl border font-extrabold tracking-wide ${getStatusColor(order.status)}`}>
                 {order.status}
               </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
               <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 flex-shrink-0"><Truck size={24} /></div>
                  <div>
                     <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Shipping To</p>
                     <p className="font-bold text-gray-900 leading-relaxed">
                       {order.customerDetails?.address?.street}<br/>
                       {order.customerDetails?.address?.city}, {order.customerDetails?.address?.country}
                     </p>
                  </div>
               </div>
               <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 flex-shrink-0"><CreditCard size={24} /></div>
                  <div>
                     <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Payment</p>
                     <p className="font-extrabold text-gray-900 flex items-center gap-2">
                       {order.paymentMethod}
                       {order.paymentStatus === 'Paid' && <CheckCircle2 size={16} className="text-green-600" />}
                     </p>
                  </div>
               </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
               <h3 className="font-extrabold text-gray-900 mb-4">Items Ordered</h3>
               <div className="space-y-4">
                 {order.items?.map((item, idx) => (
                   <div key={idx} className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                           <img src={item.image || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=200'} className="w-full h-full object-cover" />
                         </div>
                         <div>
                            <p className="font-bold text-gray-900 line-clamp-1">{item.title}</p>
                            <p className="text-sm font-semibold text-gray-500">Qty: {item.quantity}</p>
                         </div>
                      </div>
                      <p className="font-extrabold text-gray-900">GHS {item.price}</p>
                   </div>
                 ))}
               </div>
               <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between items-center">
                  <span className="font-bold text-gray-500 uppercase tracking-wider text-sm">Total Paid</span>
                  <span className="font-black text-2xl text-green-700">GHS {order.total}</span>
               </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
