import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  ChevronLeft,
  Star,
  ShieldCheck,
  Truck,
  Heart,
  Share2,
  Plus,
  Minus,
} from "lucide-react";

import { useCartStore } from "../store/useCartStore";
import api from "../api";
import ProductCard from "../components/ProductCard";

const ProductDetails = () => {
  const { id } = useParams();

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  const { addToCart, setCheckoutOpen } = useCartStore();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data } = await api.get(`/products/${id}`);
      const p = data.data || data;
      
      // If sizes/colors are empty but variants exist, extract them
      if (p.hasVariants && p.variants?.length > 0) {
        if (!p.sizes?.length) {
          const s = new Set();
          p.variants.forEach(v => {
            const size = v.attributes?.get?.("size") || v.attributes?.size;
            if (size) s.add(size);
          });
          p.sizes = Array.from(s);
        }
        if (!p.colors?.length) {
          const c = new Set();
          p.variants.forEach(v => {
            const color = v.attributes?.get?.("color") || v.attributes?.color;
            if (color) c.add(color);
          });
          p.colors = Array.from(c);
        }
      }
      return p;
    },
  });

  const { data: relatedProducts } = useQuery({
    queryKey: ["related-products", product?.category?.slug || product?.category?._id || product?.category],
    enabled: !!(product?.category),
    queryFn: async () => {
      // Backend filters by slug or ObjectId — *not* by name
      const catParam =
        product.category?.slug ||
        product.category?._id ||
        product.category;

      const { data } = await api.get("/products", {
        params: { category: catParam, limit: 6 },
      });

      const list = data.data || data;

      // Exclude the current product from the results
      return list.filter((p) => p._id !== id).slice(0, 5);
    },
  });

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (!product)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <p className="text-2xl font-bold">Product Not Found</p>
        <Link to="/shop" className="text-primary font-semibold underline">
          Go Back to Shop
        </Link>
      </div>
    );

  return (
    <div className="bg-base-100 min-h-screen pt-28 pb-20">

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">

        {/* BACK LINK */}
        <Link
          to="/shop"
          className="flex items-center gap-2 text-sm text-base-content/60 hover:text-primary mb-10"
        >
          <ChevronLeft size={16} />
          Back to Shop
        </Link>

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* PRODUCT GALLERY */}
          <div className="space-y-6">

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-square rounded-3xl bg-base-200 border border-base-300 flex items-center justify-center relative p-10 overflow-hidden"
            >
              {product.images?.length > 0 ? (
                <img
                  src={product.images[activeImage] || product.images?.[0]}
                  alt={product.title}
                  className="object-contain w-full h-full transition-transform duration-500 hover:scale-105"
                />
              ) : (
                <ShoppingBag size={64} className="text-base-content/10" />
              )}

              <button className="absolute top-4 right-4 bg-white p-3 rounded-full shadow hover:text-red-500 transition-colors">
                <Heart size={20} />
              </button>
            </motion.div>

            {/* THUMBNAILS */}
            <div className="flex gap-4 overflow-x-auto pb-2">
              {(product.images || []).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-20 h-20 min-w-[5rem] rounded-xl overflow-hidden border-2 transition
                  ${
                    activeImage === idx
                      ? "border-primary"
                      : "border-transparent hover:border-base-300"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="object-contain w-full h-full p-2"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* PRODUCT INFO */}
          <div className="space-y-8">

            <div>
              <span className="badge badge-primary badge-outline mb-4">
                Premium Selection
              </span>

              <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight">
                {product.title}
              </h1>

              {/* PRICE + RATING */}
              <div className="flex flex-wrap items-center gap-6 mt-5">

                <div className="flex items-baseline gap-2">
                   <p className="text-3xl font-extrabold text-primary">
                    GHS {(product.discountPrice ?? product.price ?? 0).toFixed(2)}
                  </p>
                  {product.discountPrice && (
                    <p className="text-lg text-base-content/30 line-through">
                      GHS {(product.price ?? 0).toFixed(2)}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 border-l border-base-300 pl-6">
                  <div className="flex text-yellow-500">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={i <= Math.round(product.averageRating || 0) ? "currentColor" : "none"}
                        className={i <= Math.round(product.averageRating || 0) ? "" : "text-base-content/20"}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-base-content/70">
                    ({product.reviewCount || 0} reviews)
                  </span>
                </div>

              </div>
            </div>

            {/* DESCRIPTION */}
            <p className="text-base-content/70 text-lg leading-relaxed">
              {product.description ||
                "Experience the perfect blend of elegance and quality. Carefully curated to elevate your everyday style."}
            </p>

            {/* OPTIONS (SIZES & COLORS) - JUMIA STYLE */}
            {(product.sizes?.length > 0 || product.colors?.length > 0) && (
              <div className="space-y-8 pt-4 border-t border-base-200">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-base-content/40">
                    Variation Available
                  </span>
                  {product.hasVariants && (
                    <span className="text-[10px] font-bold text-primary cursor-pointer hover:underline">
                      Size Guide
                    </span>
                  )}
                </div>

                {product.sizes?.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black uppercase tracking-wider text-base-content/80">
                        Select Size
                      </span>
                      {selectedSize && (
                        <span className="text-xs font-bold text-primary">Selected: {selectedSize}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`h-11 px-6 rounded-xl text-xs font-bold transition-all duration-300 border-2 flex items-center justify-center min-w-[3.5rem]
                          ${
                            selectedSize === size
                              ? "bg-primary border-primary text-primary-content shadow-lg shadow-primary/20 scale-105"
                              : "border-base-200 text-base-content/60 hover:border-primary/40 hover:text-primary"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {product.colors?.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black uppercase tracking-wider text-base-content/80">
                        Select Color
                      </span>
                      {selectedColor && (
                        <span className="text-xs font-bold text-primary">Selected: {selectedColor}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {product.colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`h-11 px-5 rounded-xl text-xs font-bold transition-all duration-300 border-2 flex items-center justify-center min-w-[5rem]
                          ${
                            selectedColor === color
                              ? "bg-primary border-primary text-primary-content shadow-lg shadow-primary/20 scale-105"
                              : "border-base-200 text-base-content/60 hover:border-primary/40 hover:text-primary"
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* FEATURES */}
            <div className="flex flex-wrap gap-8 py-6 border-y border-base-200 text-xs font-black uppercase tracking-widest text-base-content/60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShieldCheck size={16} className="text-primary" />
                </div>
                Authentic Quality
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Truck size={16} className="text-primary" />
                </div>
                Quick Delivery
              </div>
            </div>

            {/* ACTION AREA */}
            <div className="space-y-6 pt-2">
               {/* QUANTITY & SHARE */}
               <div className="flex items-center gap-4">
                <div className="flex items-center bg-base-200/50 p-1.5 rounded-2xl border border-base-300">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-base-300 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center font-black text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-base-300 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div className="flex gap-2">
                  <button className="btn btn-ghost btn-circle bg-base-200/50 border border-base-300 hover:bg-primary/10 hover:text-primary hover:border-primary/20">
                    <Share2 size={18} />
                  </button>
                  <button className="btn btn-ghost btn-circle bg-base-200/50 border border-base-300 hover:bg-red-50/50 hover:text-red-500 hover:border-red-100">
                    <Heart size={18} />
                  </button>
                </div>
              </div>

              {/* BUY BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => {
                    if (product.sizes?.length > 0 && !selectedSize) return alert("Please select a size before adding to cart");
                    if (product.colors?.length > 0 && !selectedColor) return alert("Please select a color before adding to cart");
                    addToCart({ ...product, selectedSize, selectedColor }, quantity);
                  }}
                  className="btn btn-primary h-14 flex-1 gap-3 rounded-[1.25rem] font-black text-[13px] uppercase tracking-widest shadow-xl shadow-primary/20 border-none group"
                >
                  <ShoppingBag size={20} className="group-hover:scale-110 transition-transform" />
                  Add to Cart
                </button>

                <button
                  onClick={() => {
                    if (product.sizes?.length > 0 && !selectedSize) return alert("Please select a size before checkout");
                    if (product.colors?.length > 0 && !selectedColor) return alert("Please select a color before checkout");
                    addToCart({ ...product, selectedSize, selectedColor }, quantity);
                    setCheckoutOpen(true);
                  }}
                  className="btn btn-neutral h-14 flex-1 rounded-[1.25rem] font-black text-[13px] uppercase tracking-widest bg-[#000] border-none hover:bg-zinc-800"
                >
                  Checkout Now
                </button>
              </div>
            </div>

            {/* TRUST BADGES */}
            <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-base-200 mt-6">
              <div className="flex items-center gap-4 bg-base-100 border border-base-200 p-4 rounded-2xl">
                <div className="p-2 bg-base-200 rounded-lg"><Truck size={20} className="text-primary" /></div>
                <div>
                  <p className="font-black text-[11px] uppercase tracking-wider">Swift Delivery</p>
                  <p className="text-[10px] font-bold opacity-40">Within 24-48 Hours</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-base-100 border border-base-200 p-4 rounded-2xl">
                <div className="p-2 bg-base-200 rounded-lg"><ShieldCheck size={20} className="text-primary" /></div>
                <div>
                  <p className="font-black text-[11px] uppercase tracking-wider">Safe Checkout</p>
                  <p className="text-[10px] font-bold opacity-40">SSL Encrypted Hub</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* RELATED PRODUCTS - JUMIA STYLE CAROUSEL GRID */}
        {relatedProducts?.length > 0 && (
          <section className="mt-40 border-t border-base-200 pt-20">
            <div className="flex items-center justify-between mb-12">
               <div>
                  <h2 className="text-3xl font-black tracking-tight mb-2 uppercase tracking-[0.05em]">Explore more</h2>
                  <div className="h-1.5 w-16 bg-primary rounded-full"></div>
               </div>
               <Link to="/shop" className="text-xs font-black uppercase tracking-widest text-primary hover:underline">View All Collection</Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-12 gap-x-6 md:gap-x-10">
              {relatedProducts
                .map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default ProductDetails;