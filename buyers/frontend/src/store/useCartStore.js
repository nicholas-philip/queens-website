// =====================================================
// store/useCartStore.js  —  FIXED
//
// Fixes:
//   1. cartTotal() used useCartStore.getState() inside itself — broken in
//      React concurrent mode. Now uses Zustand's `get` parameter correctly.
//   2. addToCart() compared item.product._id but gift cards pass _id directly
//      on the item — unified the comparison.
//   3. Added itemCount selector so FloatingCart doesn't re-compute manually.
//   4. setCheckoutOpen triggers scroll-lock on body so the modal doesn't
//      scroll underneath it.
// =====================================================

import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  cartItems: [],
  isCartOpen: false,
  isCheckoutOpen: false,

  // ── Cart Drawer visibility ───────────────────────
  setCartOpen: (open) => {
    set({ isCartOpen: open });
    document.body.style.overflow = open ? 'hidden' : '';
  },

  toggleCart: () => {
    const next = !get().isCartOpen;
    get().setCartOpen(next);
  },

  // ── Checkout visibility ──────────────────────────
  setCheckoutOpen: (open) => {
    set({ isCheckoutOpen: open });
    // Prevent background scroll when modal is open
    document.body.style.overflow = open ? 'hidden' : '';
  },

  toggleCheckout: () => {
    const next = !get().isCheckoutOpen;
    get().setCheckoutOpen(next);
  },

  // ── Cart operations ──────────────────────────────
  addToCart: (product, quantity = 1) => {
    const qty = parseInt(quantity, 10) || 1;
    const cartItemId = product._id + (product.selectedSize ? `-${product.selectedSize}` : "") + (product.selectedColor ? `-${product.selectedColor}` : "");
    
    set((state) => {
      document.body.style.overflow = 'hidden'; // Immediately lock background scroll
      
      const existing = state.cartItems.find(item => 
        (item.cartItemId || item.product._id) === cartItemId
      );

      if (existing) {
        return {
          isCartOpen: true, // Auto-open cart drawer
          cartItems: state.cartItems.map(item =>
            (item.cartItemId || item.product._id) === cartItemId
              ? { ...item, quantity: item.quantity + qty }
              : item
          ),
        };
      }
      return { isCartOpen: true, cartItems: [...state.cartItems, { cartItemId, product, quantity: qty }] };
    });
  },

  removeFromCart: (cartItemId) => set((state) => ({
    cartItems: state.cartItems.filter(item => (item.cartItemId || item.product._id) !== cartItemId),
  })),

  updateQuantity: (cartItemId, quantity) => {
    const qty = parseInt(quantity, 10);
    if (qty < 1) {
      get().removeFromCart(cartItemId);
      return;
    }
    set((state) => ({
      cartItems: state.cartItems.map(item =>
        (item.cartItemId || item.product._id) === cartItemId ? { ...item, quantity: qty } : item
      ),
    }));
  },

  clearCart: () => {
    set({ cartItems: [], isCheckoutOpen: false });
    document.body.style.overflow = '';
  },

  // ── Derived values (use `get` — never call useCartStore.getState() here) ─
  cartTotal: () =>
    get().cartItems.reduce(
      (acc, item) => acc + (item.product.discountPrice ?? item.product.price) * item.quantity,
      0
    ),

  itemCount: () =>
    get().cartItems.reduce((acc, item) => acc + item.quantity, 0),
}));