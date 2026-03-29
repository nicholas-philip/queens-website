import React, { useState } from 'react';
import { RotateCcw, ArrowRight, ShieldCheck, Mail, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

const RequestReturn = () => {
  const [formData, setFormData] = useState({ trackingNumber: '', email: '', reason: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.trackingNumber || !formData.email || !formData.reason) return;

    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/returns', {
        orderId: formData.trackingNumber, // Assuming API accepts orderId or tracking
        email: formData.email,
        reason: formData.reason
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not process return request. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSuccess(false);
    setFormData({ trackingNumber: '', email: '', reason: '' });
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-20 font-sans">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Column: Context */}
        <div className="flex flex-col justify-center max-w-lg">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900 mb-8 border border-gray-100 shadow-sm">
            <RotateCcw size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">Hassle-Free <span className="text-gray-400 font-serif italic">Returns</span>.</h1>
          <p className="text-gray-500 font-medium text-lg mb-10 leading-relaxed">
            Not completely in love with your purchase? Request a Return Merchandise Authorization (RMA) within 30 days of delivery.
          </p>
          
          <div className="space-y-6">
             <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <ShieldCheck className="text-green-700 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Authenticity Guaranteed</h4>
                  <p className="text-gray-500 text-sm font-medium leading-relaxed">Returned items must be unused and in original pristine packaging to qualify for a full refund or exchange.</p>
                </div>
             </div>
             <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <Package className="text-green-700 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Easy Processing</h4>
                  <p className="text-gray-500 text-sm font-medium leading-relaxed">Submit the form here. If approved, you will receive a printable shipping label and secure instructions via email.</p>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-gray-100 relative overflow-hidden">
           {/* Decorative BG element */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-gray-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 pointer-events-none"></div>

           <AnimatePresence mode="wait">
             {!success ? (
               <motion.form 
                  key="form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleSubmit} 
                  className="space-y-6 relative z-10"
                >
                  <h3 className="text-2xl font-extrabold text-gray-900 mb-8">Start a Return</h3>

                  <div className="space-y-4">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Tracking / Order ID</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. QNS-584A-9214"
                      value={formData.trackingNumber}
                      onChange={(e) => setFormData({...formData, trackingNumber: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-gray-900 font-bold focus:border-green-700 focus:ring-1 focus:ring-green-700 outline-none transition-all placeholder:font-medium placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block flex items-center gap-2"><Mail size={14}/> Contact Email</label>
                    <input 
                      type="email" 
                      required
                      placeholder="Email used for the order"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-gray-900 font-bold focus:border-green-700 focus:ring-1 focus:ring-green-700 outline-none transition-all placeholder:font-medium placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Reason for Return</label>
                    <select
                      required
                      value={formData.reason}
                      onChange={(e) => setFormData({...formData, reason: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-gray-900 font-bold focus:border-green-700 focus:ring-1 focus:ring-green-700 outline-none transition-all appearance-none"
                    >
                      <option value="" disabled>Select a reason...</option>
                      <option value="Item arrived damaged or defective">Item arrived damaged or defective</option>
                      <option value="Incorrect item received">Incorrect item received</option>
                      <option value="Not satisfied with product quality">Not satisfied with product quality</option>
                      <option value="Purchased by mistake">Purchased by mistake</option>
                      <option value="Changed my mind">Changed my mind</option>
                    </select>
                  </div>

                  {error && <p className="text-red-500 font-bold tracking-wide mt-2 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

                  <button 
                    type="submit" 
                    disabled={loading || !formData.trackingNumber || !formData.email || !formData.reason}
                    className="w-full mt-8 bg-gray-900 text-white font-extrabold px-8 py-5 rounded-xl hover:bg-black transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    {loading ? 'Processing...' : 'Submit Request'} <ArrowRight size={20} />
                  </button>
               </motion.form>
             ) : (
               <motion.div 
                 key="success"
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="flex flex-col items-center text-center py-10 relative z-10"
               >
                 <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-700 mb-8 border border-green-100 shadow-sm">
                   <ShieldCheck size={40} />
                 </div>
                 <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Request Submitted</h2>
                 <p className="text-gray-500 font-medium mb-8 leading-relaxed max-w-sm">
                   Your RMA request for order <span className="font-bold text-gray-900">{formData.trackingNumber}</span> has been received. 
                   Our conciliators will review it and email instructions to <span className="font-bold text-gray-900">{formData.email}</span> within 24 hours.
                 </p>
                 <button 
                    onClick={handleReset}
                    className="text-gray-400 font-bold hover:text-green-700 uppercase tracking-widest text-sm transition-colors border-b-2 border-transparent hover:border-green-700 pb-1"
                  >
                    Submit Another Return
                  </button>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default RequestReturn;
