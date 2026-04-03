// =====================================================
// pages/Rewards.jsx  —  RESPONSIVE + THEME-AWARE
// =====================================================

import React, { useState } from 'react';
import { Gift, Star, Award, Phone, ArrowRight, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

const TIER_STYLES = {
  Bronze:   'bg-warning/20 text-warning border-warning/40',
  Silver:   'bg-base-200 text-base-content/70 border-base-300',
  Gold:     'bg-primary/15 text-primary border-primary/30',
  Platinum: 'bg-secondary/20 text-secondary border-secondary/30',
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
    <div className="min-h-screen bg-base-200/40 pt-24 pb-16 sm:pb-20 font-sans transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-10">

        {/* Left: Input */}
        <div className="md:col-span-5 flex flex-col justify-center">
          <div className="w-12 sm:w-14 h-12 sm:h-14 bg-base-100 shadow-xl rounded-2xl flex items-center justify-center text-primary mb-5 sm:mb-6">
            <Gift size={26} />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-base-content tracking-tight mb-3 sm:mb-4 leading-tight">
            Queens <span className="text-primary">Rewards</span>.
          </h1>
          <p className="text-base-content/60 font-medium text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed">
            Every purchase earns you points. Enter your WhatsApp number to check your tier and redeem for discounts.
          </p>

          <form onSubmit={handleCheck} className="flex flex-col gap-3">
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40" size={18} />
              <input
                type="tel"
                placeholder="0XX XXX XXXX"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-base-100 border border-base-300 rounded-2xl px-12 py-4 text-base-content font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:font-medium placeholder:text-base-content/30 shadow-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !phone.trim()}
              className="btn btn-neutral rounded-2xl py-4 font-extrabold disabled:opacity-40 shadow-xl active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Checking...</> : 'View My Rewards'}
            </button>
            {error && <p className="text-error font-bold text-sm">{error}</p>}
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
                className="bg-base-100 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 md:p-10 shadow-2xl border border-base-200 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 opacity-40 pointer-events-none" />

                <div className="relative z-10 space-y-5 sm:space-y-6">
                  {/* Tier + Points */}
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`px-3 py-1 rounded-lg border font-black tracking-widest text-[10px] uppercase mb-2 sm:mb-3 inline-block ${TIER_STYLES[account.tier] || TIER_STYLES.Bronze}`}>
                        {account.tier} Tier
                      </span>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-base-content">{account.firstName || 'Queen'}</h2>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase text-base-content/40 tracking-widest mb-0.5">Points</p>
                      <p className="text-4xl sm:text-5xl font-black text-primary">{account.currentBalance?.toLocaleString() ?? 0}</p>
                    </div>
                  </div>

                  {/* Progress to next tier */}
                  {tierInfo && (
                    <div>
                      <div className="flex justify-between text-xs text-base-content/40 font-bold mb-1.5">
                        <span>{account.tier}</span>
                        <span>{tierInfo.name}</span>
                      </div>
                      <div className="h-2 bg-base-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-700"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <p className="text-xs text-base-content/40 mt-1.5">
                        {tierInfo.pointsNeeded} more points to {tierInfo.name}
                      </p>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-base-200 rounded-2xl p-3 sm:p-4 border border-base-300">
                      <p className="text-[10px] uppercase tracking-widest text-base-content/40 font-bold mb-1">Total earned</p>
                      <p className="text-lg sm:text-xl font-black text-base-content">{account.totalEarned?.toLocaleString() ?? 0} pts</p>
                    </div>
                    <div className="bg-base-200 rounded-2xl p-3 sm:p-4 border border-base-300">
                      <p className="text-[10px] uppercase tracking-widest text-base-content/40 font-bold mb-1">Total redeemed</p>
                      <p className="text-lg sm:text-xl font-black text-base-content">{account.totalRedeemed?.toLocaleString() ?? 0} pts</p>
                    </div>
                  </div>

                  {/* Redemption */}
                  {account.currentBalance >= 100 && !redeemResult && (
                    <div className="border-t border-base-200 pt-4 sm:pt-5">
                      <p className="text-sm font-extrabold text-base-content mb-2 sm:mb-3 flex items-center gap-2">
                        <Award size={16} className="text-primary" /> Redeem Points
                      </p>
                      <p className="text-xs text-base-content/40 mb-3">
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
                          className="flex-1 bg-base-200 border border-base-300 rounded-xl px-4 py-3 text-base-content font-bold text-sm focus:border-primary outline-none transition-all"
                        />
                        <button
                          onClick={handleRedeem}
                          disabled={redeemLoading || redeemPoints < 100 || redeemPoints > account.currentBalance}
                          className="btn btn-primary rounded-xl px-4 sm:px-5 py-3 font-extrabold disabled:opacity-40 text-sm flex items-center gap-1.5 shrink-0"
                        >
                          {redeemLoading ? '...' : <><ArrowRight size={15} />Redeem</>}
                        </button>
                      </div>
                      {redeemPoints >= 100 && (
                        <p className="text-xs text-primary font-bold mt-1.5">
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
                      className="bg-success/10 border border-success/30 rounded-2xl p-4 sm:p-5"
                    >
                      <div className="flex items-center gap-2 text-success font-bold mb-2">
                        <CheckCircle size={18} /> Redemption Successful!
                      </div>
                      <p className="text-base-content/70 text-sm mb-3">{redeemResult.message}</p>
                      {redeemResult.couponCode && (
                        <div className="bg-base-100 rounded-xl p-3 border border-success/20 text-center">
                          <p className="text-xs text-base-content/40 font-bold uppercase tracking-widest mb-1">Your discount code</p>
                          <p className="font-mono font-black text-lg sm:text-xl text-base-content tracking-widest">{redeemResult.couponCode}</p>
                          <p className="text-xs text-base-content/40 mt-1">Valid for 7 days · Enter at checkout</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                className="bg-base-100 rounded-[2rem] sm:rounded-[2.5rem] p-8 sm:p-12 shadow-sm border border-base-200 h-full min-h-[300px] flex flex-col items-center justify-center text-center"
              >
                <div className="w-20 sm:w-24 h-20 sm:h-24 bg-base-200 rounded-full flex items-center justify-center text-base-content/20 mb-5 sm:mb-6">
                  <Star size={36} />
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-base-content mb-2">Check Your Rewards</h3>
                <p className="text-base-content/40 font-medium text-sm sm:text-base">Enter your number to unlock your dashboard.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default Rewards;