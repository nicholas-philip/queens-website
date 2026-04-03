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
      await api.post('/returns', {
        orderId: formData.trackingNumber,
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
    <div className="min-h-screen bg-base-100 pt-24 pb-16 sm:pb-20 font-sans transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 items-center">
        
        {/* Left Column: Context */}
        <div className="flex flex-col justify-center max-w-lg">
          <div className="w-14 sm:w-16 h-14 sm:h-16 bg-base-200 rounded-2xl flex items-center justify-center text-base-content mb-6 sm:mb-8 border border-base-300 shadow-sm">
            <RotateCcw size={30} />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-base-content tracking-tight mb-4 sm:mb-6">Hassle-Free <span className="text-base-content/30 font-serif italic">Returns</span>.</h1>
          <p className="text-base-content/60 font-medium text-base sm:text-lg mb-8 sm:mb-10 leading-relaxed">
            Not completely in love with your purchase? Request a Return Merchandise Authorization (RMA) within 30 days of delivery.
          </p>
          
          <div className="space-y-4 sm:space-y-6">
             <div className="flex items-start gap-4 p-5 sm:p-6 bg-base-200 rounded-2xl border border-base-300">
                <ShieldCheck className="text-primary flex-shrink-0 mt-1" size={22} />
                <div>
                  <h4 className="font-bold text-base-content mb-1 text-sm sm:text-base">Authenticity Guaranteed</h4>
                  <p className="text-base-content/60 text-xs sm:text-sm font-medium leading-relaxed">Returned items must be unused and in original pristine packaging to qualify for a full refund or exchange.</p>
                </div>
             </div>
             <div className="flex items-start gap-4 p-5 sm:p-6 bg-base-200 rounded-2xl border border-base-300">
                <Package className="text-primary flex-shrink-0 mt-1" size={22} />
                <div>
                  <h4 className="font-bold text-base-content mb-1 text-sm sm:text-base">Easy Processing</h4>
                  <p className="text-base-content/60 text-xs sm:text-sm font-medium leading-relaxed">Submit the form here. If approved, you will receive a printable shipping label and secure instructions via email.</p>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="bg-base-100 rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 md:p-12 shadow-2xl border border-base-200 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-base-200 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 pointer-events-none"></div>

           <AnimatePresence mode="wait">
             {!success ? (
               <motion.form 
                  key="form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleSubmit} 
                  className="space-y-5 sm:space-y-6 relative z-10"
                >
                  <h3 className="text-xl sm:text-2xl font-extrabold text-base-content mb-6 sm:mb-8">Start a Return</h3>

                  <div className="space-y-3 sm:space-y-4">
                    <label className="text-xs font-bold text-base-content/40 uppercase tracking-widest block">Tracking / Order ID</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. QNS-584A-9214"
                      value={formData.trackingNumber}
                      onChange={(e) => setFormData({...formData, trackingNumber: e.target.value})}
                      className="w-full bg-base-200 border border-base-300 rounded-xl px-5 py-4 text-base-content font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:font-medium placeholder:text-base-content/30"
                    />
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <label className="text-xs font-bold text-base-content/40 uppercase tracking-widest flex items-center gap-2 block"><Mail size={14}/> Contact Email</label>
                    <input 
                      type="email" 
                      required
                      placeholder="Email used for the order"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-base-200 border border-base-300 rounded-xl px-5 py-4 text-base-content font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:font-medium placeholder:text-base-content/30"
                    />
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <label className="text-xs font-bold text-base-content/40 uppercase tracking-widest block">Reason for Return</label>
                    <select
                      required
                      value={formData.reason}
                      onChange={(e) => setFormData({...formData, reason: e.target.value})}
                      className="w-full bg-base-200 border border-base-300 rounded-xl px-5 py-4 text-base-content font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none"
                    >
                      <option value="" disabled>Select a reason...</option>
                      <option value="Item arrived damaged or defective">Item arrived damaged or defective</option>
                      <option value="Incorrect item received">Incorrect item received</option>
                      <option value="Not satisfied with product quality">Not satisfied with product quality</option>
                      <option value="Purchased by mistake">Purchased by mistake</option>
                      <option value="Changed my mind">Changed my mind</option>
                    </select>
                  </div>

                  {error && <p className="text-error font-bold tracking-wide text-sm bg-error/10 p-3 rounded-lg border border-error/20">{error}</p>}

                  <button 
                    type="submit" 
                    disabled={loading || !formData.trackingNumber || !formData.email || !formData.reason}
                    className="w-full mt-6 sm:mt-8 btn btn-neutral rounded-xl py-5 font-extrabold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    {loading ? 'Processing...' : 'Submit Request'} <ArrowRight size={20} />
                  </button>
               </motion.form>
             ) : (
               <motion.div 
                 key="success"
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="flex flex-col items-center text-center py-8 sm:py-10 relative z-10"
               >
                 <div className="w-16 sm:w-20 h-16 sm:h-20 bg-success/10 rounded-full flex items-center justify-center text-success mb-6 sm:mb-8 border border-success/20 shadow-sm">
                   <ShieldCheck size={36} />
                 </div>
                 <h2 className="text-2xl sm:text-3xl font-extrabold text-base-content mb-3 sm:mb-4">Request Submitted</h2>
                 <p className="text-base-content/60 font-medium mb-6 sm:mb-8 leading-relaxed max-w-sm text-sm sm:text-base">
                   Your RMA request for order <span className="font-bold text-base-content">{formData.trackingNumber}</span> has been received. 
                   Our conciliators will review it and email instructions to <span className="font-bold text-base-content">{formData.email}</span> within 24 hours.
                 </p>
                 <button 
                    onClick={handleReset}
                    className="text-base-content/40 font-bold hover:text-primary uppercase tracking-widest text-sm transition-colors border-b-2 border-transparent hover:border-primary pb-1"
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
