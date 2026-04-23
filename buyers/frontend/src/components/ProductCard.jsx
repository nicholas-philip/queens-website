import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Star } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';

const ProductCard = ({ product }) => {
  const { addToCart } = useCartStore();
  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const wishlisted      = isWishlisted(product._id);
  const [addedFeedback, setAddedFeedback]   = useState(false);
  const [wishedFeedback, setWishedFeedback] = useState(false);

  const price        = product.price;
  const salePrice    = product.discountPrice ?? null;
  const displayPrice = salePrice ?? price;
  const isOutOfStock = product.status === 'Out of Stock' || product.stockQuantity === 0;
  const discountPct  = salePrice ? Math.round((1 - salePrice / price) * 100) : 0;
  const image        = product.images?.[0] ?? null;
  const rating       = product.averageRating ?? 0;
  const reviewCount  = product.reviewCount ?? 0;
  const categoryName = product.category?.name ?? '';

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (isOutOfStock) return;
    addToCart(product, 1);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1500);
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const wasAlreadyAdded = wishlisted;
    await toggleWishlist(product._id);
    
    if (!wasAlreadyAdded) {
      setWishedFeedback(true);
      setTimeout(() => setWishedFeedback(false), 1000);
    }
  };

  return (
    <div className="group relative flex flex-col bg-base-100 rounded-2xl border border-base-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-500 h-full">

      {/* ── Image ─────────────────────────── */}
      <Link to={`/product/${product._id}`} className="relative block overflow-hidden aspect-[5/6] bg-base-200/30">
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {image ? (
          <img
            src={image}
            alt={product.title}
            loading="lazy"
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isOutOfStock ? 'opacity-40 grayscale' : ''}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-base-content/10">
            <ShoppingBag size={40} strokeWidth={1} />
          </div>
        )}

        {/* Out of Stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <span className="bg-black/80  text-primary text-xs font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border border-primary/20 shadow-xl">
              Sold Out
            </span>
          </div>
        )}

        {/* Discount badge */}
        {discountPct > 0 && (
          <div className="absolute top-2.5 left-2.5 z-20 bg-primary text-primary-content text-xs font-black px-2 py-1 rounded-lg shadow-md">
            -{discountPct}%
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-base-100  flex items-center justify-center shadow-md border border-base-content/5 z-20 md:opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 hover:scale-110 active:scale-95 ${wishedFeedback ? 'scale-125 !bg-primary !border-primary' : ''}`}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            size={16}
            className={`${wishlisted ? 'fill-red-500 text-red-500' : 'text-base-content/30'} ${wishedFeedback ? 'fill-primary-content text-primary-content animate-ping' : ''} transition-colors duration-300`}
          />
        </button>
      </Link>

      {/* ── Details ──────────────────────── */}
      <div className="flex flex-col flex-1 p-3 md:p-4 gap-1.5 md:gap-2">
        {/* Category & Rating */}
        <div className="flex justify-between items-center min-h-[1rem]">
          {categoryName ? (
            <span className="text-xs uppercase tracking-[0.18em] text-primary font-black truncate">{categoryName}</span>
          ) : <span />}
          {reviewCount > 0 && (
            <div className="flex items-center gap-1 shrink-0">
              <Star size={9} className="fill-primary text-primary" />
              <span className="text-xs text-base-content/50 font-black">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-base-content text-xs md:text-sm leading-snug line-clamp-2 min-h-[2.4em]">
          <Link to={`/product/${product._id}`} className="hover:text-primary transition-colors duration-300">
            {product.title}
          </Link>
        </h3>

        {/* Price & Cart */}
        <div className="mt-auto pt-2 md:pt-3 flex items-center justify-between border-t border-base-200">
          <div className="flex flex-col">
            <span className="text-base-content font-black text-sm md:text-base tracking-tight">
              GHS {displayPrice.toLocaleString()} {product.priceSuffix && <span className="text-[10px] opacity-40 font-bold ml-0.5">{product.priceSuffix}</span>}
            </span>
            {salePrice && (
              <span className="text-base-content/30 text-xs md:text-xs line-through font-bold">
                GHS {price.toLocaleString()}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex-shrink-0 flex items-center justify-center transition-all active:scale-90 shadow-sm border ${
              isOutOfStock
                ? 'bg-base-200 text-base-content/20 cursor-not-allowed border-transparent'
                : addedFeedback
                ? 'bg-[#0A0A0A] text-primary border-primary/30'
                : 'bg-primary text-primary-content hover:shadow-xl hover:shadow-primary/20 border-transparent'
            }`}
            aria-label="Add to cart"
          >
            {addedFeedback ? (
              <Star size={14} className="fill-primary animate-pulse" />
            ) : (
              <ShoppingBag size={14} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

