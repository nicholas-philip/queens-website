// =====================================================
// components/FloatingCart.jsx  —  FIXED + IMPROVED
//
// Fixes:
//   1. count was computed inline with reduce — now uses itemCount() selector
//   2. total displayed product.price — now uses discountPrice if set
//   3. Pulse animation only shows when items are in cart (not always)
// =====================================================

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';

const FloatingCart = () => {
  const { cartItems, cartTotal, itemCount, setCheckoutOpen, isCheckoutOpen } = useCartStore();

  const count = itemCount();
  const total = cartTotal();

  // Hide when empty or when modal is already open
  if (count === 0 || isCheckoutOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="floating-cart"
        initial={{ y: 100, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 100, opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-6 right-4 md:right-6 z-50"
      >
        <button
          onClick={() => setCheckoutOpen(true)}
          className="group relative flex items-center gap-3 bg-gold hover:bg-gold-light pl-2 pr-5 py-2 rounded-full shadow-2xl shadow-gold/30 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          {/* Icon */}
          <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center relative flex-shrink-0">
            <ShoppingBag size={20} className="text-black" />
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-black text-gold text-xs font-black flex items-center justify-center border border-gold">
              {count > 9 ? '9+' : count}
            </span>
          </div>

          {/* Text */}
          <div className="text-left">
            <p className="text-xs uppercase tracking-widest font-bold text-black/60 leading-none">Your bag</p>
            <p className="text-black font-black text-[15px] leading-tight">GHS {total.toFixed(2)}</p>
          </div>
        </button>

        {/* Ripple — only renders when count > 0 */}
        <span className="absolute inset-0 rounded-full border-2 border-gold animate-ping opacity-20 pointer-events-none" />
      </motion.div>
    </AnimatePresence>
  );
};

export default FloatingCart;
