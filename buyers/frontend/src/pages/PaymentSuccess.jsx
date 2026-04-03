import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, ShoppingBag, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
// import confetti from 'canvas-confetti';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('ref') || searchParams.get('reference');
  const [verifying, setVerifying] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!reference) {
      setError('Missing payment reference.');
      setVerifying(false);
      return;
    }

    const verify = async () => {
      try {
        const { data } = await api.get(`/payment/verify/${reference}`);
        if (data.success) {
          setOrder(data.order);
        } else {
          setError(data.message || 'Payment could not be verified.');
        }
      } catch (err) {
        setError('An error occurred during verification.');
      } finally {
        setVerifying(false);
      }
    };

    verify();
  }, [reference]);

  if (verifying) {
    return (
      <div className="min-h-screen bg-black-rich flex flex-col items-center justify-center p-6 bg-[#050505]">
         <div className="relative">
            <div className="w-24 h-24 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
               <Loader2 className="text-gold animate-pulse" size={32} />
            </div>
         </div>
         <h2 className="text-xl font-black text-white mt-8 tracking-[0.2em] uppercase">Verifying Payment</h2>
         <p className="text-white/40 text-sm mt-2 font-medium tracking-tight">One moment while we confirm with Paystack...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
         <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-[2rem] flex items-center justify-center text-red-500 mb-8">
            <CheckCircle size={40} className="rotate-180" />
         </div>
         <h1 className="text-3xl font-black text-white tracking-tight mb-4">Verification Issue</h1>
         <p className="text-white/40 max-w-md mx-auto mb-10 leading-relaxed font-medium">
           {error} If you have already paid, please don't worry. Your order will be processed as soon as we receive the confirmation.
         </p>
         <Link to="/" className="btn btn-primary rounded-2xl px-12 py-4 h-auto font-black shadow-xl shadow-primary/20">
           Return Home
         </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 overflow-hidden">
      <div className="max-w-2xl mx-auto">
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-12"
        >
          <div className="w-24 h-24 bg-gold/10 border-2 border-gold/30 rounded-[2.5rem] flex items-center justify-center text-gold mx-auto mb-8 shadow-[0_20px_50px_rgba(201,168,76,0.2)]">
             <CheckCircle size={48} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter mb-4">Payment Success!</h1>
          <p className="text-white/50 text-lg font-medium tracking-tight">Thank you for your purchase. Your order is now being processed.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-8 border-b border-white/10">
             <div>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Order Number</p>
                <h2 className="text-xl font-black text-white tracking-tight">{order?.orderNumber}</h2>
             </div>
             <div className="px-5 py-2.5 bg-green-500/10 border border-green-500/20 text-green-500 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <Package size={14} /> Processing
             </div>
          </div>

          <div className="py-8 space-y-6">
             <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/20 shrink-0"><Package size={22} /></div>
                <div>
                   <h3 className="text-white font-bold text-sm mb-1 uppercase tracking-widest text-[11px]">Preparing Shipment</h3>
                   <p className="text-white/40 text-xs leading-relaxed font-medium">Our team is currently selecting and packing your luxury items with the utmost care.</p>
                </div>
             </div>
             <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/20 shrink-0"><ShoppingBag size={22} /></div>
                <div>
                   <h3 className="text-white font-bold text-sm mb-1 uppercase tracking-widest text-[11px]">Next Steps</h3>
                   <p className="text-white/40 text-xs leading-relaxed font-medium">You will receive a confirmation message on WhatsApp once your order is on its way.</p>
                </div>
             </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row gap-4">
             <Link to="/orders" className="flex-1 btn btn-primary rounded-2xl py-4 h-auto font-black text-sm shadow-xl shadow-primary/20 flex items-center justify-center gap-2">
                My Order History <ArrowRight size={18} />
             </Link>
             <Link to="/shop" className="flex-1 btn btn-ghost border border-white/10 rounded-2xl py-4 h-auto font-black text-sm text-white/60 hover:text-white flex items-center justify-center gap-2">
                Keep Shopping
             </Link>
          </div>
        </motion.div>

        <p className="text-center text-white/20 text-[10px] mt-10 uppercase tracking-[0.3em] font-black">
          ✦ Secured by Paystack & Queens Fashion Store ✦
        </p>

      </div>
    </div>
  );
};

export default PaymentSuccess;