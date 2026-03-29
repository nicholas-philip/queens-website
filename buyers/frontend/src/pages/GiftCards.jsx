// =====================================================
// pages/GiftCards.jsx  —  FIXED
//
// Fixes:
//   1. addToCart({ _id, title, price, ... }) doesn't match the cart store
//      which expects { product: {...}, quantity: 1 }. Gift cards added
//      the wrong shape so cartTotal() and checkout rendering both crashed.
//   2. Missing recipientEmail validation before enabling checkout
//   3. Preset amounts were raw numbers (100, 250) — backend validates against
//      [2000, 5000, 10000, 20000, 50000] (pesewas). Updated to match the
//      GHS values the backend actually accepts after conversion.
//   4. Added direct API call to POST /api/gift-cards/buy instead of going
//      through the cart (gift cards are fulfilled via email, not shipping).
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
  const [amount, setAmount]               = useState(10000); // GHS 100 default
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName]   = useState('');
  const [purchaserName, setPurchaserName]   = useState('');
  const [purchaserEmail, setPurchaserEmail] = useState('');
  const [message, setMessage]             = useState('');
  const [loading, setLoading]             = useState(false);
  const [success, setSuccess]             = useState(null);
  const [error, setError]                 = useState('');

  const displayAmount = (amount / 100).toFixed(0); // pesewas → GHS display

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
      <div className="min-h-screen bg-white pt-24 pb-20 font-sans flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-700 mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Gift Sent!</h2>
          <p className="text-gray-500 font-medium mb-2">
            A <strong className="text-gray-900">GHS {displayAmount}</strong> gift card has been emailed to{' '}
            <strong className="text-gray-900">{recipientEmail}</strong>.
          </p>
          {success.giftCard?.code && (
            <div className="bg-gray-50 rounded-2xl p-4 my-6 border border-gray-100">
              <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Gift card code</p>
              <p className="font-mono font-black text-2xl text-gray-900 tracking-widest">{success.giftCard.code}</p>
            </div>
          )}
          <button
            onClick={() => { setSuccess(null); setRecipientEmail(''); setRecipientName(''); setPurchaserName(''); setPurchaserEmail(''); setMessage(''); }}
            className="text-gray-400 font-bold hover:text-green-700 uppercase tracking-widest text-sm transition-colors"
          >
            Send another
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-20 font-sans">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 pt-8">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">

          {/* Card preview */}
          <div className="w-full md:w-1/2 flex justify-center">
            <motion.div
              initial={{ opacity: 0, rotate: -3, scale: 0.95 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="relative w-full max-w-lg aspect-[1.6/1] rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-green-900 via-green-800 to-green-700" />
              <div className="relative z-10 p-8 md:p-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start">
                  <div className="w-14 h-14 bg-white/10 backdrop-blur-md flex items-center justify-center rounded-2xl border border-white/20">
                    <span className="text-white font-black text-3xl font-serif italic">Q</span>
                  </div>
                  <span className="text-white/60 font-bold uppercase tracking-[0.3em] text-[10px] bg-black/20 px-4 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                    Digital Gift Card
                  </span>
                </div>
                <div>
                  <p className="text-green-300 font-bold tracking-widest text-sm uppercase mb-1">Value</p>
                  <p className="text-5xl md:text-6xl font-black text-white">GHS {displayAmount}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Form */}
          <div className="w-full md:w-1/2 max-w-lg">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
              The Perfect <span className="text-green-700 italic font-serif">Gift</span>.
            </h1>
            <p className="text-gray-500 font-medium text-lg leading-relaxed mb-8">
              Instantly email a digital gift card — valid for all boutique items.
            </p>

            <form onSubmit={handlePurchase} className="space-y-6">

              {/* Amount */}
              <div>
                <label className="text-sm font-extrabold text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-3">
                  <CreditCard size={15} className="text-green-700" /> Select Amount
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {PRESET_AMOUNTS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setAmount(opt.value)}
                      className={`py-3 rounded-xl font-black text-sm transition-all border-2 ${
                        amount === opt.value
                          ? 'border-green-700 bg-green-50 text-green-700'
                          : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Your details */}
              <div className="space-y-3">
                <label className="text-sm font-extrabold text-gray-900 uppercase tracking-widest block">Your Details</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    required
                    placeholder="Your name *"
                    value={purchaserName}
                    onChange={e => setPurchaserName(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-bold text-sm focus:border-green-700 outline-none transition-all placeholder:font-medium placeholder:text-gray-400"
                  />
                  <input
                    required
                    type="email"
                    placeholder="Your email *"
                    value={purchaserEmail}
                    onChange={e => setPurchaserEmail(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-bold text-sm focus:border-green-700 outline-none transition-all placeholder:font-medium placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Recipient */}
              <div className="space-y-3">
                <label className="text-sm font-extrabold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                  <Mail size={14} className="text-green-700" /> Recipient Details
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    required
                    placeholder="Recipient name *"
                    value={recipientName}
                    onChange={e => setRecipientName(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-bold text-sm focus:border-green-700 outline-none transition-all placeholder:font-medium placeholder:text-gray-400"
                  />
                  <input
                    required
                    type="email"
                    placeholder="Recipient email *"
                    value={recipientEmail}
                    onChange={e => setRecipientEmail(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-bold text-sm focus:border-green-700 outline-none transition-all placeholder:font-medium placeholder:text-gray-400"
                  />
                </div>
                <textarea
                  rows={3}
                  placeholder="Personal message (optional)"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-bold text-sm focus:border-green-700 outline-none transition-all placeholder:font-medium placeholder:text-gray-400 resize-none"
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm font-bold bg-red-50 px-4 py-3 rounded-xl border border-red-100">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-700 text-white font-extrabold px-8 py-5 rounded-2xl hover:bg-green-800 transition-colors shadow-xl disabled:opacity-60 flex items-center justify-center gap-3 text-lg active:scale-[0.98]"
              >
                {loading ? <><Loader size={20} className="animate-spin" /> Processing...</> : <><Send size={20} /> Send Gift Card</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftCards;