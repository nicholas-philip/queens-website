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
    <div className="group relative flex flex-col bg-base-100 rounded-[1.75rem] border border-base-content/8 overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 h-full">

      {/* ── Image ─────────────────────────────────── */}
      <Link to={`/product/${product._id}`} className="relative block overflow-hidden aspect-square bg-base-200/60">
        {image ? (
          <img
            src={image}
            alt={product.title}
            loading="lazy"
            className={`w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-105 ${isOutOfStock ? 'opacity-50' : ''}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-base-content/20">
            <ShoppingBag size={36} />
          </div>
        )}

        {/* Overlays */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-base-100/90 backdrop-blur-sm text-base-content/60 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-base-content/10">
              Out of stock
            </span>
          </div>
        )}

        {discountPct > 0 && (
          <div className="absolute top-3 left-3 bg-primary text-primary-content text-[10px] font-black px-2 py-1 rounded-full">
            -{discountPct}%
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-base-100/80 backdrop-blur-sm flex items-center justify-center shadow-sm border border-base-content/8 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            size={15}
            className={wishlisted ? 'fill-red-500 text-red-500' : 'text-base-content/40'}
          />
        </button>
      </Link>

      {/* ── Details ───────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Category */}
        {categoryName && (
          <p className="text-[10px] uppercase tracking-widest text-base-content/40 font-bold">{categoryName}</p>
        )}

        {/* Title */}
        <h3 className="font-bold text-base-content text-[14px] leading-snug line-clamp-2 flex-1">
          <Link to={`/product/${product._id}`} className="hover:text-primary transition-colors">
            {product.title}
          </Link>
        </h3>

        {/* Rating */}
        {reviewCount > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="flex">
              {[1,2,3,4,5].map(i => (
                <Star
                  key={i}
                  size={11}
                  className={i <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-base-content/15'}
                />
              ))}
            </div>
            <span className="text-[11px] text-base-content/40 font-medium">({reviewCount})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-primary font-extrabold text-[16px]">
            GHS {displayPrice.toFixed(2)}
          </span>
          {salePrice && (
            <span className="text-base-content/30 text-[12px] line-through">
              GHS {price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`mt-1 w-full py-3 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 transition-all active:scale-[0.97] ${
            isOutOfStock
              ? 'bg-base-200 text-base-content/30 cursor-not-allowed'
              : addedFeedback
              ? 'bg-green-500 text-white'
              : 'bg-primary text-primary-content hover:brightness-110 shadow-md'
          }`}
        >
          {addedFeedback ? (
            '✓ Added!'
          ) : (
            <>
              <ShoppingBag size={15} />
              {isOutOfStock ? 'Out of stock' : 'Add to cart'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;