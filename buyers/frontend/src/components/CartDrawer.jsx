import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { Link } from 'react-router-dom';

const FREE_SHIPPING_THRESHOLD = 1500;

export default function CartDrawer() {
  const { isCartOpen, setCartOpen, cartItems, cartTotal, removeFromCart, updateQuantity, setCheckoutOpen } = useCartStore();

  const total = cartTotal();
  const amountToFreeShipping = FREE_SHIPPING_THRESHOLD - total;
  const progressPercent = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100);

  if (!isCartOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setCartOpen(false)}
        />

        {/* Drawer Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 250 }}
          className="relative w-full max-w-md h-full bg-base-100 shadow-2xl flex flex-col z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-base-200 bg-base-100 flex-shrink-0">
            <h2 className="text-lg font-black tracking-tight flex items-center gap-2 text-base-content">
              <ShoppingBag size={20} />
              YOUR BAG
            </h2>
            <button
              onClick={() => setCartOpen(false)}
              className="p-2 -mr-2 text-base-content/50 hover:text-base-content hover:bg-base-200 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="px-6 py-4 bg-base-100 border-b border-base-200 flex-shrink-0">
            {amountToFreeShipping > 0 ? (
              <p className="text-xs font-semibold text-base-content/70 mb-2">
                You're <span className="text-primary font-bold">GHS {amountToFreeShipping.toFixed(2)}</span> away from <strong>FREE SHIPPING!</strong>
              </p>
            ) : (
              <p className="text-xs font-bold text-success mb-2">
                🎉 Congratulations! You qualify for Free Shipping.
              </p>
            )}
            <div className="w-full h-2 bg-base-300 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full ${amountToFreeShipping > 0 ? 'bg-primary' : 'bg-success'}`}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-base-100">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-base-content/40 space-y-4 pt-10">
                <ShoppingBag size={48} className="opacity-20" />
                <p className="font-medium text-sm">Your shopping bag is empty.</p>
                <button 
                  onClick={() => setCartOpen(false)}
                  className="mt-4 px-6 py-3 bg-neutral text-neutral-content rounded-xl font-bold text-sm tracking-wide"
                >
                  CONTINUE SHOPPING
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.cartItemId || item.product._id} className="flex gap-4 py-4 border-b border-base-200 last:border-0 relative group">
                  
                  {/* Image */}
                  <div className="w-20 h-24 rounded-xl bg-neutral/5 overflow-hidden flex-shrink-0 border border-base-200/50">
                    {item.product.images?.[0] || item.product.image ? (
                      <img
                        src={item.product.images?.[0] || item.product.image}
                        alt={item.product.title}
                        className="w-full h-full object-cover mix-blend-multiply"
                      />
                    ) : null}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 pr-6 relative">
                    <Link to={`/product/${item.product._id}`} onClick={() => setCartOpen(false)} className="text-sm font-bold text-base-content leading-tight hover:text-primary transition-colors block truncate">
                      {item.product.title}
                    </Link>
                    
                    <div className="mt-1 text-xs text-base-content/60 space-y-0.5">
                      {item.product.selectedSize && <p>Size: <span className="text-base-content font-medium">{item.product.selectedSize}</span></p>}
                      {item.product.selectedColor && <p>Color: <span className="text-base-content font-medium">{item.product.selectedColor}</span></p>}
                    </div>

                    <p className="mt-2 text-sm font-black text-primary">
                      GHS {((item.product.discountPrice ?? item.product.price)).toFixed(2)} {item.product.priceSuffix && <span className="text-[10px] opacity-50 font-bold ml-0.5">{item.product.priceSuffix}</span>}
                    </p>

                    {/* Quantity controls */}
                    <div className="mt-3 flex items-center w-24 h-8 rounded-lg border border-base-300 overflow-hidden">
                      <button onClick={() => updateQuantity(item.cartItemId || item.product._id, item.quantity - 1)} className="flex-1 flex justify-center items-center h-full hover:bg-base-200 text-base-content/60 hover:text-base-content rounded-l-lg transition-colors">
                        <Minus size={12} />
                      </button>
                      <span className="w-8 flex justify-center items-center h-full text-xs font-bold text-base-content bg-base-100 select-none">
                        {item.quantity}
                      </span>
                      <button onClick={() => updateQuantity(item.cartItemId || item.product._id, item.quantity + 1)} className="flex-1 flex justify-center items-center h-full hover:bg-base-200 text-base-content/60 hover:text-base-content rounded-r-lg transition-colors">
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.cartItemId || item.product._id)}
                      className="absolute top-0 right-0 p-1.5 text-base-content/30 hover:text-error hover:bg-error/10 rounded-md transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer / Checkout */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-base-200 bg-base-50 flex-shrink-0">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-xs uppercase tracking-widest font-bold text-base-content/50">Subtotal</p>
                  <p className="text-xs text-base-content/40 mt-0.5">Tax and shipping calculated at checkout.</p>
                </div>
                <p className="text-xl font-black text-neutral">GHS {total.toFixed(2)}</p>
              </div>

              <button
                onClick={() => {
                  setCartOpen(false);
                  setCheckoutOpen(true);
                }}
                className="w-full py-4 bg-neutral hover:bg-neutral-focus text-neutral-content rounded-[1.25rem] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-neutral/20 border-none group"
              >
                Checkout Now <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

