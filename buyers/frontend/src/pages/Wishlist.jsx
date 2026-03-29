import React, { useState, useEffect } from 'react';
import { Heart, Search, X } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import { useWishlistStore } from '../store/useWishlistStore';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { fetchWishlist, clearWishlist: apiClear } = useWishlistStore();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const items = await fetchWishlist();
      setWishlistItems(items);
      setLoading(false);
    };
    loadData();
  }, [fetchWishlist]);

  const clearWishlist = async () => {
    await apiClear();
    setWishlistItems([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20 font-sans">
      
      {/* Header */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 pt-8 mb-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
           <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-2">My <span className="text-green-700 italic font-serif">Wishlist</span>.</h1>
           <p className="text-gray-500 font-medium text-lg">Curate your perfect collection of Queens essentials.</p>
        </div>
        {wishlistItems.length > 0 && (
          <button 
            onClick={clearWishlist}
            className="text-gray-400 font-bold hover:text-red-600 uppercase tracking-widest text-xs transition-colors flex items-center gap-2 border border-transparent hover:border-red-100 bg-white px-4 py-2 rounded-full shadow-sm hover:bg-red-50"
          >
            <X size={14}/> Clear List
          </button>
        )}
      </div>

      {/* Main Grid */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="aspect-[3/4] bg-gray-200 animate-pulse rounded-[2rem] border border-gray-100" />
            ))}
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-80 bg-white rounded-[3rem] shadow-sm border border-gray-100">
             <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-700 mb-6 group-hover:scale-110 transition-transform"><Heart size={40} className="fill-green-700/20"/></div>
             <p className="text-2xl font-extrabold text-gray-900 mb-2">Your wishlist is empty</p>
             <p className="text-gray-500 font-medium mb-8">Save items you love and build your dream collection.</p>
             <a href="/shop" className="bg-gray-900 text-white font-extrabold px-8 py-4 rounded-xl hover:bg-black transition-colors shadow-lg active:scale-[0.98]">
               Explore Shop
             </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
            {wishlistItems.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Wishlist;
