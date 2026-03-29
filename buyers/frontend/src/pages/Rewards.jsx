// =====================================================
// pages/Rewards.jsx  —  FIXED
//
// Fixes:
//   1. Was reading account.pointsBalance — backend returns account.currentBalance
//      → points always showed as undefined
//   2. Was reading account.lifetimePoints — backend returns account.totalEarned
//   3. Was reading account.totalReferrals — backend returns separate referral API
//   4. Redemption wired to POST /api/loyalty/redeem — returns coupon code
//   5. Added history link → GET /api/loyalty/:phone/history
// =====================================================

import React, { useState } from 'react';
import { Gift, Star, Award, Phone, ArrowRight, Clock, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

const TIER_STYLES = {
  Bronze:   'bg-amber-50  text-amber-700  border-amber-200',
  Silver:   'bg-gray-100  text-gray-700   border-gray-300',
  Gold:     'bg-yellow-50 text-yellow-700 border-yellow-200',
  Platinum: 'bg-purple-50 text-purple-700 border-purple-200',
};

const TIER_THRESHOLDS = {
  Bronze: 0, Silver: 2000, Gold: 5000, Platinum: 10000,
};

const nextTier = (tier, earned) => {
  if (tier === 'Platinum') return null;
  const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum'];
  const next = tiers[tiers.indexOf(tier) + 1];
  return { name: next, pointsNeeded: TIER_THRESHOLDS[next] - earned };
};

const Rewards = () => {
  const [phone, setPhone]         = useState('');
  const [account, setAccount]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [redeemPoints, setRedeem] = useState(0);
  const [redeemResult, setResult] = useState(null);
  const [redeemLoading, setRL]    = useState(false);

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    setError('');
    setAccount(null);
    setResult(null);
    try {
      const { data } = await api.get(`/loyalty/${phone.replace(/\s/g, '')}`);
      if (data.exists && data.account) {
        setAccount(data.account);
      } else {
        setError(data.message || 'No rewards account found. Make a purchase to start earning!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not find an account with that number.');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!redeemPoints || redeemPoints < 100) return;
    setRL(true);
    try {
      const { data } = await api.post('/loyalty/redeem', {
        phone: phone.replace(/\s/g, ''),
        points: redeemPoints,
      });
      setResult(data);
      // Update balance locally
      setAccount(a => ({ ...a, currentBalance: data.newBalance }));
    } catch (err) {
      alert(err.response?.data?.message || 'Redemption failed.');
    } finally {
      setRL(false);
    }
  };

  const tierInfo = account ? nextTier(account.tier, account.totalEarned) : null;
  const progressPct = account && tierInfo
    ? Math.min(100, ((account.totalEarned - TIER_THRESHOLDS[account.tier]) / (TIER_THRESHOLDS[tierInfo.name] - TIER_THRESHOLDS[account.tier])) * 100)
    : 100;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20 font-sans">
      <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-10">

        {/* Left: Input */}
        <div className="md:col-span-5 flex flex-col justify-center">
          <div className="w-14 h-14 bg-white shadow-xl rounded-2xl flex items-center justify-center text-green-700 mb-6">
            <Gift size={28} />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4 leading-tight">
            Queens <span className="text-green-700">Rewards</span>.
          </h1>
          <p className="text-gray-500 font-medium text-lg mb-8 leading-relaxed">
            Every purchase earns you points. Enter your WhatsApp number to check your tier and redeem for discounts.
          </p>

          <form onSubmit={handleCheck} className="flex flex-col gap-3">
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="tel"
                placeholder="0XX XXX XXXX"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-2xl px-12 py-4 text-gray-900 font-bold focus:border-green-700 focus:ring-1 focus:ring-green-700 outline-none transition-all placeholder:font-medium placeholder:text-gray-400 shadow-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !phone.trim()}
              className="bg-gray-900 text-white font-extrabold px-6 py-4 rounded-2xl hover:bg-black transition-colors disabled:opacity-40 shadow-xl active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Checking...</> : 'View My Rewards'}
            </button>
            {error && <p className="text-red-500 font-bold text-sm">{error}</p>}
          </form>
        </div>

        {/* Right: Dashboard */}
        <div className="md:col-span-7">
          <AnimatePresence mode="wait">
            {account ? (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-gray-100 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-green-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-40 pointer-events-none" />

                <div className="relative z-10 space-y-6">
                  {/* Tier + Name */}
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`px-3 py-1 rounded-lg border font-black tracking-widest text-[10px] uppercase mb-3 inline-block ${TIER_STYLES[account.tier] || TIER_STYLES.Bronze}`}>
                        {account.tier} Tier
                      </span>
                      <h2 className="text-2xl font-extrabold text-gray-900">{account.firstName || 'Queen'}</h2>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-0.5">Points</p>
                      <p className="text-5xl font-black text-green-700">{account.currentBalance?.toLocaleString() ?? 0}</p>
                    </div>
                  </div>

                  {/* Progress to next tier */}
                  {tierInfo && (
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 font-bold mb-1.5">
                        <span>{account.tier}</span>
                        <span>{tierInfo.name}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-700 rounded-full transition-all duration-700"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1.5">
                        {tierInfo.pointsNeeded} more points to {tierInfo.name}
                      </p>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Total earned</p>
                      <p className="text-xl font-black text-gray-900">{account.totalEarned?.toLocaleString() ?? 0} pts</p>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Total redeemed</p>
                      <p className="text-xl font-black text-gray-900">{account.totalRedeemed?.toLocaleString() ?? 0} pts</p>
                    </div>
                  </div>

                  {/* Redemption */}
                  {account.currentBalance >= 100 && !redeemResult && (
                    <div className="border-t border-gray-100 pt-5">
                      <p className="text-sm font-extrabold text-gray-900 mb-3 flex items-center gap-2">
                        <Award size={16} className="text-green-700" /> Redeem Points
                      </p>
                      <p className="text-xs text-gray-400 mb-3">
                        100 points = GHS 5 discount. Min. 100 points.
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min={100}
                          max={account.currentBalance}
                          step={100}
                          value={redeemPoints}
                          onChange={e => setRedeem(parseInt(e.target.value) || 0)}
                          placeholder="Points to redeem"
                          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-bold text-sm focus:border-green-700 outline-none transition-all"
                        />
                        <button
                          onClick={handleRedeem}
                          disabled={redeemLoading || redeemPoints < 100 || redeemPoints > account.currentBalance}
                          className="px-5 py-3 bg-green-700 text-white font-extrabold rounded-xl hover:bg-green-800 transition-colors disabled:opacity-40 text-sm flex items-center gap-1.5"
                        >
                          {redeemLoading ? '...' : <><ArrowRight size={15} /> Redeem</>}
                        </button>
                      </div>
                      {redeemPoints >= 100 && (
                        <p className="text-xs text-green-700 font-bold mt-1.5">
                          = GHS {((redeemPoints / 100) * 5).toFixed(2)} discount
                        </p>
                      )}
                    </div>
                  )}

                  {/* Redeem success */}
                  {redeemResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-green-50 border border-green-200 rounded-2xl p-5"
                    >
                      <div className="flex items-center gap-2 text-green-700 font-bold mb-2">
                        <CheckCircle size={18} /> Redemption Successful!
                      </div>
                      <p className="text-gray-700 text-sm mb-3">{redeemResult.message}</p>
                      {redeemResult.couponCode && (
                        <div className="bg-white rounded-xl p-3 border border-green-200 text-center">
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Your discount code</p>
                          <p className="font-mono font-black text-xl text-gray-900 tracking-widest">{redeemResult.couponCode}</p>
                          <p className="text-xs text-gray-400 mt-1">Valid for 7 days · Enter at checkout</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100 h-full flex flex-col items-center justify-center text-center"
              >
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6">
                  <Star size={40} />
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Check Your Rewards</h3>
                <p className="text-gray-400 font-medium">Enter your number to unlock your dashboard.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default Rewards;