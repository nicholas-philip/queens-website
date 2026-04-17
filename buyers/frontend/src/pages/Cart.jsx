import React from 'react';
import { useCartStore } from '../store/useCartStore';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, Lock } from 'lucide-react';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, setCheckoutOpen } = useCartStore();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center pt-24 bg-base-100 px-4 transition-colors duration-300">
        <div className="w-20 h-20 rounded-full bg-base-200 flex items-center justify-center text-base-content/30 mb-6">
          <ShoppingBag size={36} />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-base-content mb-4 uppercase tracking-tight">Your Cart is Empty</h2>
        <p className="text-base-content/60 mb-8 max-w-md text-center font-medium">Looks like you haven't added anything yet. Discover our latest collections.</p>
        <Link to="/shop" className="btn btn-primary rounded-full px-8 font-black uppercase tracking-widest shadow-lg shadow-primary/20">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200/40 pt-24 md:pt-28 pb-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-base-content mb-8 md:mb-10 uppercase">Your Bag</h1>
        
        <div className="flex flex-col lg:flex-row gap-6 md:gap-10 lg:gap-12">
          {/* Cart Items */}
          <div className="lg:w-2/3 bg-base-100 p-4 sm:p-6 rounded-2xl shadow-sm border border-base-200">
            <div className="space-y-4 md:space-y-5">
              {cartItems.map((item) => (
                <div key={item.cartItemId || item.product._id} className="flex gap-3 sm:gap-4 p-3 sm:p-4 border border-base-200 rounded-xl relative hover:shadow-md hover:border-primary/20 transition-all">
                  <div className="w-20 h-24 sm:w-28 sm:h-28 bg-base-200 rounded-xl overflow-hidden shrink-0 border border-base-200">
                    <img 
                      src={item.product.images?.[0] || item.product.image} 
                      alt={item.product.title} 
                      className="object-cover w-full h-full mix-blend-multiply"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <Link to={`/product/${item.product._id}`} className="text-sm font-black text-base-content hover:text-primary transition-colors line-clamp-2 leading-tight">
                          {item.product.title}
                        </Link>
                        <p className="font-black text-primary text-sm shrink-0 hidden sm:block">
                          GHS {((item.product.discountPrice ?? item.product.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mb-3">
                        <p className="text-xs text-base-content/50 font-medium">{item.product.category?.name || item.product.category}</p>
                        {item.product.selectedSize && (
                          <span className="text-xs px-2 py-0.5 bg-base-200 text-base-content/70 rounded-full font-black uppercase">
                            {item.product.selectedSize}
                          </span>
                        )}
                        {item.product.selectedColor && (
                          <span className="text-xs px-2 py-0.5 bg-base-200 text-base-content/70 rounded-full font-black capitalize">
                            {item.product.selectedColor}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center border border-base-300 rounded-xl overflow-hidden">
                        <button 
                          onClick={() => updateQuantity(item.cartItemId || item.product._id, Math.max(1, item.quantity - 1))}
                          className="w-9 h-9 flex items-center justify-center text-base-content/60 hover:bg-base-200 font-bold transition-colors">−</button>
                        <span className="w-9 h-9 flex items-center justify-center text-sm font-black border-x border-base-300">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.cartItemId || item.product._id, item.quantity + 1)}
                          className="w-9 h-9 flex items-center justify-center text-base-content/60 hover:bg-base-200 font-bold transition-colors">+</button>
                      </div>
                      <p className="font-black text-primary text-sm sm:hidden">
                        GHS {((item.product.discountPrice ?? item.product.price) * item.quantity).toFixed(2)}
                      </p>
                      <button 
                        onClick={() => removeFromCart(item.cartItemId || item.product._id)}
                        className="text-base-content/30 hover:text-error transition-colors p-2 rounded-xl hover:bg-error/10"
                        title="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-base-100 p-5 sm:p-6 rounded-2xl shadow-sm border border-base-200 lg:sticky lg:top-28">
              <h2 className="text-base font-black tracking-widest text-base-content mb-5 uppercase">Order Summary</h2>
              
              <div className="space-y-3 text-sm text-base-content/60 mb-5 border-b border-base-200 pb-5">
                <div className="flex justify-between">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-black text-base-content">GHS {cartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Shipping</span>
                  <span className="font-medium text-base-content/40 text-xs">Calculated at checkout</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Tax</span>
                  <span className="font-black text-base-content">GHS 0.00</span>
                </div>
              </div>
              
              <div className="flex justify-between items-end mb-6">
                <span className="text-xs font-black text-base-content/50 uppercase tracking-widest">Total</span>
                <span className="text-2xl font-black text-primary">GHS {cartTotal().toFixed(2)}</span>
              </div>
              
              <button 
                onClick={() => setCheckoutOpen(true)}
                className="w-full py-4 bg-neutral text-neutral-content rounded-2xl font-black text-sm uppercase tracking-widest hover:brightness-90 transition-all shadow-xl shadow-neutral/20 active:scale-95 flex items-center justify-center gap-2"
              >
                <ShoppingBag size={18} /> Checkout Now
              </button>
              
              <p className="text-xs text-center text-base-content/30 mt-5 flex items-center justify-center gap-1.5 font-bold tracking-widest uppercase">
                <Lock size={12} /> SSL Encrypted Checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
