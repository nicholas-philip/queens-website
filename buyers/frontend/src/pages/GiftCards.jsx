// =====================================================
// pages/GiftCards.jsx  —  RESPONSIVE + THEME-AWARE
// =====================================================

import React, { useState } from 'react';
import { Gift, CreditCard, Mail, Send, CheckCircle2, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api';

const PRESET_AMOUNTS = [
  { label: 'GHS 20',  value: 2000  },
  { label: 'GHS 50',  value: 5000  },
  { label: 'GHS 100', value: 10000 },
  { label: 'GHS 200', value: 20000 },
  { label: 'GHS 500', value: 50000 },
];

const GiftCards = () => {
  const [amount, setAmount]               = useState(10000);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName]   = useState('');
  const [purchaserName, setPurchaserName]   = useState('');
  const [purchaserEmail, setPurchaserEmail] = useState('');
  const [message, setMessage]             = useState('');
  const [loading, setLoading]             = useState(false);
  const [success, setSuccess]             = useState(null);
  const [error, setError]                 = useState('');

  const displayAmount = (amount / 100).toFixed(0);

  const handlePurchase = async (e) => {
    e.preventDefault();
    if (!recipientEmail.trim() || !recipientName.trim() || !purchaserName.trim() || !purchaserEmail.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/gift-cards/buy', {
        amount,
        purchaserName:   purchaserName.trim(),
        purchaserEmail:  purchaserEmail.trim(),
        recipientName:   recipientName.trim(),
        recipientEmail:  recipientEmail.trim(),
        personalMessage: message.trim(),
      });
      setSuccess(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-base-100 pt-24 pb-20 font-sans flex items-center justify-center px-4 sm:px-6 transition-colors duration-300">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center text-success mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-base-content mb-3">Gift Sent!</h2>
          <p className="text-base-content/60 font-medium mb-2">
            A <strong className="text-base-content">GHS {displayAmount}</strong> gift card has been emailed to{' '}
            <strong className="text-base-content">{recipientEmail}</strong>.
          </p>
          {success.giftCard?.code && (
            <div className="bg-base-200 rounded-2xl p-4 my-6 border border-base-300">
              <p className="text-xs text-base-content/40 uppercase tracking-widest font-bold mb-1">Gift card code</p>
              <p className="font-mono font-black text-xl sm:text-2xl text-base-content tracking-widest">{success.giftCard.code}</p>
            </div>
          )}
          <button
            onClick={() => { setSuccess(null); setRecipientEmail(''); setRecipientName(''); setPurchaserName(''); setPurchaserEmail(''); setMessage(''); }}
            className="text-base-content/40 font-bold hover:text-primary uppercase tracking-widest text-sm transition-colors"
          >
            Send another
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 pt-24 pb-16 sm:pb-20 font-sans transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 pt-6 sm:pt-8">
        <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-12 lg:gap-20">

          {/* Card preview */}
          <div className="w-full lg:w-1/2 flex justify-center">
            <motion.div
              initial={{ opacity: 0, rotate: -3, scale: 0.95 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="relative w-full max-w-sm sm:max-w-lg aspect-[1.6/1] rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-neutral via-neutral/90 to-neutral/70" />
              <div className="relative z-10 p-6 sm:p-8 md:p-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start">
                  <div className="w-12 sm:w-14 h-12 sm:h-14 bg-white/10 backdrop-blur-md flex items-center justify-center rounded-2xl border border-white/20">
                    <span className="text-primary font-black text-2xl sm:text-3xl font-serif italic">Q</span>
                  </div>
                  <span className="text-white/60 font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[9px] sm:text-[10px] bg-black/20 px-3 sm:px-4 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                    Digital Gift Card
                  </span>
                </div>
                <div>
                  <p className="text-primary/80 font-bold tracking-widest text-xs sm:text-sm uppercase mb-1">Value</p>
                  <p className="text-4xl sm:text-5xl md:text-6xl font-black text-white">GHS {displayAmount}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Form */}
          <div className="w-full lg:w-1/2 max-w-lg mx-auto lg:mx-0">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-base-content tracking-tight mb-3 sm:mb-4">
              The Perfect <span className="text-primary italic font-serif">Gift</span>.
            </h1>
            <p className="text-base-content/60 font-medium text-base sm:text-lg leading-relaxed mb-6 sm:mb-8">
              Instantly email a digital gift card — valid for all boutique items.
            </p>

            <form onSubmit={handlePurchase} className="space-y-5 sm:space-y-6">

              {/* Amount */}
              <div>
                <label className="text-sm font-extrabold text-base-content uppercase tracking-widest flex items-center gap-2 mb-3">
                  <CreditCard size={15} className="text-primary" /> Select Amount
                </label>
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                  {PRESET_AMOUNTS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setAmount(opt.value)}
                      className={`py-2.5 sm:py-3 rounded-xl font-black text-xs sm:text-sm transition-all border-2 ${
                        amount === opt.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-base-200 bg-base-200 text-base-content/60 hover:border-base-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Your details */}
              <div className="space-y-3">
                <label className="text-sm font-extrabold text-base-content uppercase tracking-widest block">Your Details</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    required
                    placeholder="Your name *"
                    value={purchaserName}
                    onChange={e => setPurchaserName(e.target.value)}
                    className="bg-base-200 border border-base-300 rounded-xl px-4 py-3 text-base-content font-bold text-sm focus:border-primary outline-none transition-all placeholder:font-medium placeholder:text-base-content/30"
                  />
                  <input
                    required
                    type="email"
                    placeholder="Your email *"
                    value={purchaserEmail}
                    onChange={e => setPurchaserEmail(e.target.value)}
                    className="bg-base-200 border border-base-300 rounded-xl px-4 py-3 text-base-content font-bold text-sm focus:border-primary outline-none transition-all placeholder:font-medium placeholder:text-base-content/30"
                  />
                </div>
              </div>

              {/* Recipient */}
              <div className="space-y-3">
                <label className="text-sm font-extrabold text-base-content uppercase tracking-widest flex items-center gap-2">
                  <Mail size={14} className="text-primary" /> Recipient Details
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    required
                    placeholder="Recipient name *"
                    value={recipientName}
                    onChange={e => setRecipientName(e.target.value)}
                    className="bg-base-200 border border-base-300 rounded-xl px-4 py-3 text-base-content font-bold text-sm focus:border-primary outline-none transition-all placeholder:font-medium placeholder:text-base-content/30"
                  />
                  <input
                    required
                    type="email"
                    placeholder="Recipient email *"
                    value={recipientEmail}
                    onChange={e => setRecipientEmail(e.target.value)}
                    className="bg-base-200 border border-base-300 rounded-xl px-4 py-3 text-base-content font-bold text-sm focus:border-primary outline-none transition-all placeholder:font-medium placeholder:text-base-content/30"
                  />
                </div>
                <textarea
                  rows={3}
                  placeholder="Personal message (optional)"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full bg-base-200 border border-base-300 rounded-xl px-4 py-3 text-base-content font-bold text-sm focus:border-primary outline-none transition-all placeholder:font-medium placeholder:text-base-content/30 resize-none"
                />
              </div>

              {error && (
                <p className="text-error text-sm font-bold bg-error/10 px-4 py-3 rounded-xl border border-error/20">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary rounded-2xl py-5 font-extrabold shadow-xl disabled:opacity-60 flex items-center justify-center gap-3 text-base sm:text-lg active:scale-[0.98]"
              >
                {loading ? <><Loader size={20} className="animate-spin" />Processing...</> : <><Send size={20} />Send Gift Card</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftCards;