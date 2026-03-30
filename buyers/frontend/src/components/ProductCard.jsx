// =====================================================
// components/ProductCard.jsx  —  FIXED + REDESIGNED
//
// Fixes:
//   1. images[0] accessed without ?. → crashed on products with no images
//   2. Showed product.price even when discountPrice existed
//   3. Wishlist used localStorage directly (now calls server API)
//   4. addToCart passed product directly — now wraps correctly for store
//   5. Review count was hardcoded "12" — now uses actual reviewCount field
//
// UI improvements:
//   - Out-of-stock badge overlay
//   - Discount % badge
//   - Smooth image zoom on hover
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Star } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { motion } from 'framer-motion';

const ProductCard = ({ product }) => {
  const { addToCart } = useCartStore();
  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const wishlisted = isWishlisted(product._id);
  const [addedFeedback, setAddedFeedback] = useState(false);

  const price         = product.price;
  const salePrice     = product.discountPrice ?? null;
  const displayPrice  = salePrice ?? price;
  const isOutOfStock  = product.status === 'Out of Stock' || product.stockQuantity === 0;
  const discountPct   = salePrice ? Math.round((1 - salePrice / price) * 100) : 0;
  const image         = product.images?.[0] ?? null;
  const rating        = product.averageRating ?? 0;
  const reviewCount   = product.reviewCount ?? 0;
  const categoryName  = product.category?.name ?? '';

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (isOutOfStock) return;
    addToCart(product, 1);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1500);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product._id);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative flex flex-col bg-base-100 rounded-[2rem] border-2 border-base-200 overflow-hidden shadow-sm hover:shadow-2xl hover:border-primary/40 transition-all duration-500 h-full"
    >

      {/* ── Image ─────────────────────────────────── */}
      <Link to={`/product/${product._id}`} className="relative block overflow-hidden aspect-[4/5] bg-base-200/30">
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
        {image ? (
          <img
            src={image}
            alt={product.title}
            loading="lazy"
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isOutOfStock ? 'opacity-40 grayscale' : ''}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-base-content/10">
            <ShoppingBag size={48} strokeWidth={1} />
          </div>
        )}

        {/* Overlays */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <span className="bg-black/80 backdrop-blur-md text-gold text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full border border-gold/20 shadow-2xl">
              Sold Out
            </span>
          </div>
        )}

        {discountPct > 0 && (
          <div className="absolute top-4 left-4 z-20 bg-primary text-primary-content text-[11px] font-black px-3 py-1.5 rounded-lg shadow-lg rotate-[-2deg]">
             SAVE {discountPct}%
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-base-100/90 backdrop-blur-md flex items-center justify-center shadow-xl border border-base-content/5 z-20 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-110 active:scale-95"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            size={18}
            className={wishlisted ? 'fill-red-500 text-red-500' : 'text-base-content/30'}
          />
        </button>
      </Link>

      {/* ── Details ───────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4 md:p-6 gap-2 md:gap-3">
        {/* Category & Rating */}
        <div className="flex justify-between items-center">
          {categoryName && (
            <span className="text-[10px] uppercase tracking-[0.15em] text-primary font-black">{categoryName}</span>
          )}
          {reviewCount > 0 && (
            <div className="flex items-center gap-1">
              <Star size={10} className="fill-primary text-primary" />
              <span className="text-[10px] text-base-content/60 font-black">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-base-content text-[13px] md:text-[16px] leading-[1.3] line-clamp-2 min-h-[2.6em]">
          <Link to={`/product/${product._id}`} className="hover:text-primary transition-colors duration-300">
            {product.title}
          </Link>
        </h3>

        {/* Price & Cart */}
        <div className="mt-auto pt-3 md:pt-4 flex items-center justify-between border-t border-base-200">
          <div className="flex flex-col">
            <span className="text-base-content font-black text-[14px] md:text-[18px] tracking-tight truncate max-w-[80px] md:max-w-none">
              GHS {displayPrice.toLocaleString()}
            </span>
            {salePrice && (
              <span className="text-base-content/30 text-[10px] md:text-[12px] line-through font-bold">
                GHS {price.toLocaleString()}
              </span>
            )}
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-10 h-10 md:w-12 md:h-12 rounded-[1rem] md:rounded-2xl flex-shrink-0 flex items-center justify-center transition-all active:scale-90 relative shadow-sm border ${
              isOutOfStock
                ? 'bg-base-200 text-base-content/20'
                : addedFeedback
                ? 'bg-[#000000] text-primary border-primary/40'
                : 'bg-primary text-primary-content hover:shadow-xl hover:shadow-primary/20 border-transparent'
            }`}
          >
            {addedFeedback ? (
              <Star size={16} className="md:w-5 md:h-5 fill-primary animate-pulse" />
            ) : (
              <ShoppingBag size={16} className="md:w-5 md:h-5" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;