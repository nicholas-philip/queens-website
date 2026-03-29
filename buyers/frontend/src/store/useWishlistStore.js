import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api';

/**
 * useWishlistStore
 * 
 * Manages the buyer's wishlist both locally (for speed/persistence)
 * and optionally syncs with the backend via sessionId.
 */
export const useWishlistStore = create(
  persist(
    (set, get) => ({
      wishlistIds: [],
      sessionId: null,

      // Initialize session ID if not exists
      initSession: () => {
        if (!get().sessionId) {
          const id = `ws-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
          set({ sessionId: id });
        }
      },

      // Toggle an item in the wishlist
      toggleWishlist: async (productId) => {
        get().initSession();
        const { wishlistIds, sessionId } = get();
        const isAdded = wishlistIds.includes(productId);
        
        // Optimistic UI update
        const nextIds = isAdded 
          ? wishlistIds.filter(id => id !== productId) 
          : [...wishlistIds, productId];
        
        set({ wishlistIds: nextIds });

        // Sync with backend (fire and forget, don't block UI)
        try {
          await api.post(`/wishlist/${sessionId}`, { productId });
        } catch (err) {
          console.warn('Wishlist sync failed:', err.message);
          // Optional: roll back on failure, but for wishlist, local-first is usually fine
        }
      },

      // Fetch the full wishlist objects (used by Wishlist page)
      fetchWishlist: async () => {
        get().initSession();
        const { sessionId } = get();
        try {
          const { data } = await api.get(`/wishlist/${sessionId}`);
          // Backend returns { success: true, items: [{ productId: {...} }] }
          const items = data.items || [];
          const ids = items.map(i => i.productId?._id).filter(Boolean);
          set({ wishlistIds: ids });
          return items.map(i => i.productId).filter(Boolean);
        } catch (err) {
          console.error('Failed to fetch wishlist:', err);
          return [];
        }
      },

      clearWishlist: async () => {
        const { sessionId } = get();
        set({ wishlistIds: [] });
        if (sessionId) {
          try {
            await api.delete(`/wishlist/${sessionId}`);
          } catch (err) {
            console.warn('Failed to clear backend wishlist:', err.message);
          }
        }
      },

      isWishlisted: (productId) => get().wishlistIds.includes(productId),
    }),
    {
      name: 'queens-wishlist-storage',
      partialize: (state) => ({ wishlistIds: state.wishlistIds, sessionId: state.sessionId }),
    }
  )
);
