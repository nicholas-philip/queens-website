import React, { useState, useEffect } from 'react';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useWishlistStore } from '../store/useWishlistStore';
import { motion, AnimatePresence } from 'framer-motion';

const FadeUp = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { fetchWishlist, clearWishlist: apiClear, toggleWishlist } = useWishlistStore();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const items = await fetchWishlist();
        setWishlistItems(items || []);
      } catch (err) {
        console.error("Wishlist fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchWishlist]);

  const handleRemove = async (productId) => {
    await toggleWishlist(productId);
    setWishlistItems(prev => prev.filter(item => item._id !== productId));
  };

  const handleClear = async () => {
    await apiClear();
    setWishlistItems([]);
  };

  return (
    <div className="min-h-screen bg-base-100 pb-20 transition-colors duration-500">
      
      {/* ── Header Section ── */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden border-b border-base-200">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
        
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <FadeUp>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4 block">Saved For Later</span>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none mb-4">
                My <span className="font-serif italic text-primary">Favourites</span>
              </h1>
              <p className="text-base-content/50 font-medium text-sm md:text-lg max-w-lg leading-relaxed">
                A curated selection of your most desired Queens Fashion Store pieces. Take another look and make them yours.
              </p>
            </FadeUp>
          </div>
          
          {wishlistItems.length > 0 && (
            <FadeUp delay={0.1}>
              <button 
                onClick={handleClear}
                className="group flex items-center gap-3 px-6 py-3 bg-base-200/50 hover:bg-error/10 border border-base-300 hover:border-error/30 rounded-2xl transition-all duration-300"
              >
                <Trash2 size={16} className="text-base-content/40 group-hover:text-error transition-colors" />
                <span className="text-[10px] font-black uppercase tracking-widest text-base-content/60 group-hover:text-error">Clear Collection</span>
              </button>
            </FadeUp>
          )}
        </div>
      </section>

      {/* ── Main Content ── */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12 md:py-20">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="aspect-[3/4] bg-base-200/50 animate-pulse rounded-[2rem] border border-base-200" />
            ))}
          </div>
        ) : wishlistItems.length === 0 ? (
          <FadeUp>
            <div className="flex flex-col items-center justify-center py-24 md:py-40 bg-base-200/30 rounded-[3rem] border-2 border-dashed border-base-300 text-center px-6">
              <div className="relative mb-10">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary blur-[2px] scale-150 opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Heart size={48} className="text-primary/20 fill-primary/10" strokeWidth={1} />
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-base-content mb-4 tracking-tight">Your wishlist is resting.</h2>
              <p className="text-base-content/50 font-medium mb-10 max-w-sm leading-relaxed">
                It's waiting for you to find something extraordinary. Discover our new arrivals and start building your collection.
              </p>
              <Link 
                to="/shop" 
                className="btn btn-primary btn-wide rounded-full shadow-lg shadow-primary/20 text-xs font-black uppercase tracking-widest group"
              >
                Explore Shop <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </FadeUp>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
            <AnimatePresence>
              {wishlistItems.map((product, i) => (
                <motion.div 
                  key={product._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: (i % 10) * 0.05 }}
                  className="relative group"
                >
                  {/* Remove Button Overlay */}
                  <button 
                    onClick={() => handleRemove(product._id)}
                    className="absolute top-4 right-4 z-40 w-10 h-10 bg-black/80 backdrop-blur-md rounded-xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 hover:bg-error transition-all duration-300 shadow-xl border border-white/10"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 size={16} />
                  </button>

                  <ProductCard product={product} />
                  
                  {/* Quick Shop Link */}
                  <Link 
                    to={`/product/${product._id}`}
                    className="absolute bottom-20 left-4 right-4 z-20 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-[9px] font-black text-white uppercase tracking-widest text-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500 hover:bg-primary hover:text-primary-content"
                  >
                    View Details
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* ── Related / Recommendation Section ── */}
        {wishlistItems.length > 0 && (
          <FadeUp delay={0.4}>
            <div className="mt-40 pt-20 border-t border-base-200 text-center">
              <Link to="/shop" className="inline-flex flex-col items-center group">
                 <div className="w-16 h-16 rounded-full border border-base-300 flex items-center justify-center mb-6 group-hover:border-primary/40 group-hover:bg-primary/5 transition-all duration-500">
                    <ShoppingBag size={24} className="text-base-content/20 group-hover:text-primary transition-colors" />
                 </div>
                 <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-2">Continue Shopping</h3>
                 <p className="text-[11px] font-bold text-base-content/40 italic">Find more pieces to love</p>
              </Link>
            </div>
          </FadeUp>
        )}
      </div>

    </div>
  );
};

export default Wishlist;
