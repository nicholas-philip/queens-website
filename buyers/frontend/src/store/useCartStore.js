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
  isCheckoutOpen: false,

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
  addToCart: (product, quantity = 1) => set((state) => {
    const qty = parseInt(quantity, 10) || 1;
    const id  = product._id;
    const existing = state.cartItems.find(item => item.product._id === id);

    if (existing) {
      return {
        cartItems: state.cartItems.map(item =>
          item.product._id === id
            ? { ...item, quantity: item.quantity + qty }
            : item
        ),
      };
    }
    return { cartItems: [...state.cartItems, { product, quantity: qty }] };
  }),

  removeFromCart: (productId) => set((state) => ({
    cartItems: state.cartItems.filter(item => item.product._id !== productId),
  })),

  updateQuantity: (productId, quantity) => {
    const qty = parseInt(quantity, 10);
    if (qty < 1) {
      get().removeFromCart(productId);
      return;
    }
    set((state) => ({
      cartItems: state.cartItems.map(item =>
        item.product._id === productId ? { ...item, quantity: qty } : item
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